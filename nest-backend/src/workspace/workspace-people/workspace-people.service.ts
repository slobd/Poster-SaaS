import { SanitizedExpertDto } from '@/iam/users/dto/sanitized-expert'
import { TfIdf } from 'natural'
import { flatten, omit, uniq } from 'lodash'
import {
    UserRepository,
    UserWithRolesAndAvatarAndPosters,
    workspaceUserFindManyWithFilter,
} from '@/iam/users/user.repository'
import { UsersService } from '@/iam/users/users.service'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { SendMessageDto } from '../dto/send-message.dto'
import { MailService } from '@/mail/mail.service'
import { HelpersService } from '@/utils/services/helpers.service'
import { Tenant } from '@/tenant/entities/tenant.entity'
import { SendMessageMail } from '@/mail/mailables/send-message.mail'

interface IDocument {
    id: number
    content: string
}

@Injectable()
export class WorkspacePeopleService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        private readonly helpersService: HelpersService,
        private prisma: PrismaService,
    ) {}

    async findPeople(workspaceId: number): Promise<SanitizedUserDto[]> {
        const users = await this.usersService.findMany({
            workspaces: {
                some: {
                    id: workspaceId,
                },
            },
        })

        // await this.joinUserWithPostersOfTenant(users, tenantId)

        const serializedUser: SanitizedUserDto[] = []

        for (const user of users) {
            const serializedExpert: any = await this.serializeExpert(
                omit(user, ['workspaces']),
                workspaceId,
            )
            serializedUser.push(serializedExpert)
        }

        return serializedUser
    }

    async findOneUser(
        userId: number,
        workspaceId: number,
        authenticatedUserData: SanitizedUserDto
    ): Promise<SanitizedUserDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
            },
            ...workspaceUserFindManyWithFilter(userId !== authenticatedUserData.id),
        });

        if (!user)
            throw new NotFoundException(
                `Could not find a user with Id ${userId}`,
            )

        const isTheUserInTheWorkspace = user.workspaces.find(
            (w) => w.id === workspaceId,
        )
        if (!isTheUserInTheWorkspace)
            throw new NotFoundException(
                `Could not find a user with Id ${userId} inside the workspace ${workspaceId}`,
            )

        return this.serializeExpert(
            omit(user, ['workspaces'] as const),
            workspaceId,
        )
    }

    async recommendPeer(
        userId: number,
        workspaceId: number,
    ): Promise<SanitizedExpertDto[] | any[]> {
        const referenceUser = await this.userRepository.findUnique({
            id: userId,
        })
        const referenceUserKeywords = this.getFlattenedMetadata(
            referenceUser,
            'keywords',
        )
        const referenceUserTopics = this.getFlattenedMetadata(
            referenceUser,
            'topics',
        )
        const users = await this.userRepository.findManyByWorkspace(workspaceId)

        // prepare documents data
        const documents: IDocument[] = users.map((user) => {
            const id = user.id
            const topics: string[] = this.getFlattenedMetadata(user, 'topics')
            const keywords: string[] = this.getFlattenedMetadata(
                user,
                'keywords',
            )
            const title: string[] = user.posters.map((poster) => poster.title)
            // comment
            return {
                id,
                content: [...title, ...topics, ...keywords]
                    .join(' ')
                    .toLocaleLowerCase(),
            }
        })

        const tfidf = new TfIdf()

        for (const doc of documents) {
            tfidf.addDocument(doc.content)
        }

        interface ISimilarDocuments {
            id: number
            measure: number
        }

        const similarDocuments: ISimilarDocuments[] = []
        const terms = uniq([
            ...referenceUserTopics,
            ...referenceUserKeywords,
            'psychology',
        ])

        const compareTag = terms.join(' ').toLocaleLowerCase()

        tfidf.tfidfs(compareTag, function (i, measure) {
            similarDocuments.push({
                id: documents[i].id,
                measure,
            })
        })

        similarDocuments.sort((a, b) => b.measure - a.measure)
        const similarMeasure = similarDocuments.filter((x) => x.measure > 0)
        const usersIds = similarMeasure.map((doc) => doc.id)

        const recommendedUsers = await this.usersService.findMany({
            id: {
                in: usersIds,
            },
        })

        // Sort by measure
        const sortedUsers = []
        for (const similarDoc of similarDocuments) {
            const user = recommendedUsers.find(
                (recommendedUser) => recommendedUser.id === similarDoc.id,
            )
            if (user) {
                sortedUsers.push(user)
            }
        }

        const userList = []
        for (const each of sortedUsers) {
            userList.push(await this.serializeExpert(each, workspaceId))
        }

        // await this.joinUserWithPostersOfTenant(sortedUsers, tenant.id)

        return userList
    }

    async sendMessage(
        receiverId: number,
        workspaceId: number,
        sender: SanitizedUserDto,
        body: SendMessageDto,
    ): Promise<void> {
        // Checking whether the sender and receiver are in same workspace or not
        const workspaceData = await this.getWorkspaceDataForUsers(workspaceId, [
            receiverId,
            sender.id,
        ])

        if (!workspaceData) {
            throw new ForbiddenException(
                "Sorry you both don't belong same workspace",
            )
        }

        const senderData = workspaceData.users.find(
            (user) => user.id === sender.id,
        )
        const receiverData = workspaceData.users.find(
            (user) => user.id === receiverId,
        )

        const origin = this.findTenantUrl(workspaceData.tenant)
        const actionUrl = this.profileUrl(
            origin,
            receiverData.id,
            workspaceData.id,
        )
        await this.mailService.sendMail(
            new SendMessageMail({
                message: body.message,
                receiver: receiverData,
                requester: senderData,
                workspaceName: workspaceData.name,
                actionUrl,
            }),
            receiverData.email,
            workspaceData.tenant.id,
        )
    }

    private getWorkspaceDataForUsers(workspaceId: number, users: number[]) {
        return this.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                users: {
                    every: {
                        id: {
                            in: users,
                        },
                    },
                },
            },
            include: {
                tenant: true,
                users: {
                    where: {
                        id: { in: users },
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        id: true,
                        email: true,
                        organizationName: true,
                    },
                },
            },
        })
    }
    private findTenantUrl(tenant: Tenant): string {
        const protocol = this.helpersService.getProtocolBaseOnEnv()
        return `${protocol}://${tenant.host}`
    }

    private profileUrl(
        origin: string,
        userId: number,
        workspaceId: number,
    ): string {
        return `${origin}/workspace/${workspaceId}/users/${userId}/profile`
    }

    private getFlattenedMetadata(
        user: UserWithRolesAndAvatarAndPosters,
        key: 'topics' | 'keywords',
    ): string[] {
        console.log('posters: ', user.posters)
        return flatten(
            user.posters.map((poster) => poster[key].map((data) => data.name)),
        )
    }

    private async serializeExpert(
        user: any,
        workspaceId?: number,
    ): Promise<SanitizedExpertDto> {
        user.activity = {
            documents: user.posters.length,
        }

        const uniqueKeywordsAndTopics = this.getUniqueKeywordsAndTopics(
            [...user.posters, ...user.authoredPosters],
        )
        user.keywords = uniqueKeywordsAndTopics.keywords
        user.topics = uniqueKeywordsAndTopics.topics
        user.workspaceId = workspaceId
        user.tenantId = await this.getTenantIdFromWorkspaceId(workspaceId)
        return user
    }

    private async getTenantIdFromWorkspaceId(
        workspaceId: number,
    ): Promise<number> {
        const workspace = await this.prisma.workspace.findUnique({
            where: {
                id: workspaceId,
            },
        })
        return workspace.tenantId
    }

    // TODO: Should probably go in another service
    private getUniqueKeywordsAndTopics(posters: any[]): {
        keywords: string[]
        topics: string[]
    } {
        const keywords = {
            byId: {},
            allIds: [],
        }
        const topics = {
            byId: {},
            allIds: [],
        }

        for (const poster of posters) {
            for (const keyword of poster.keywords) {
                if (!keywords.byId[keyword.name]) {
                    keywords.allIds.push(keyword.name)
                    keywords.byId[keyword.name] = true
                }
            }
            for (const topic of poster.topics) {
                if (!topics.byId[topic.name]) {
                    topics.allIds.push(topic.name)
                    topics.byId[topic.name] = true
                }
            }
        }
        keywords.allIds.splice(10, keywords.allIds.length)
        topics.allIds.splice(4, topics.allIds.length)

        return {
            keywords: keywords.allIds,
            topics: topics.allIds,
        }
    }
}
