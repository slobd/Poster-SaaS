import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common'
// import { Poster } from './entities/poster.entity'
import { MulterS3FileRecord } from '@/uploads/types/MulterS3File'
// import { Upload } from '@/uploads/upload.entity'
import { UploadSave, UploadsService } from '@/uploads/uploads.service'
import { UsersService } from '@/iam/users/users.service'
import { Tenant } from '@/tenant/entities/tenant.entity'
import { MailService } from '@/mail/mail.service'
import { TenantService } from '@/tenant/tenant.service'
import { AuthorInvitationMail } from '@/mail/mailables/author-invitation.mail'
import { uniqBy } from 'lodash'
import { Upload, User } from '@prisma/client'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { BaseClass } from '@/utils/shared/base-class'
import { PrismaService } from '@/prisma/prisma.service'

export type PosterAuthorsToUsersArgs = {
    title: string
    tenant: Tenant
    user: SanitizedUserDto
    authors: SanitizedUserDto[]
}

export type HandleNewUserArgs = {
    title: string
    tenant: Tenant
    user: SanitizedUserDto
}

type PosterAssets = {
    image?: {
        id: number
    }
    pdf?: {
        id: number
    }
}

@Injectable()
export class PostersService extends BaseClass {
    constructor(
        private readonly uploadsService: UploadsService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        private readonly tenantService: TenantService,
        private readonly prisma: PrismaService,
    ) {
        super()
    }

    async validateCoauthorsAreFromSameWorkspace(
        authors: { id: number }[],
        workspaceId: number,
    ): Promise<void> {
        const dbUsers = await this.prisma.user.findMany({
            where: {
                id: {
                    in: authors.map((a) => a.id),
                },
                workspaces: {
                    some: {
                        id: workspaceId,
                    },
                },
            },
            select: {
                id: true,
                workspaces: {
                    where: {
                        id: workspaceId,
                    },
                },
            },
        })
        const dbUsersTable = dbUsers.reduce((preV, currV) => {
            preV[currV.id] = true
            return preV
        }, {})

        console.log(dbUsers, dbUsersTable)

        for (const author of authors) {
            if (!dbUsersTable[author.id])
                throw new BadRequestException(
                    `Coauthor with ID ${author.id} either does not exist or it is not in the Workspace`,
                )
        }
    }

    /**
     * Check if the poster assets where send and store them
     * @param files Object returned by the MulterS3 middleware
     * @param poster it gets the id of the png or image from the Poster
     */
    async storePosterAssets(
        files: MulterS3FileRecord,
        poster: PosterAssets,
    ): Promise<{ image?: Upload; pdf?: Upload }> {
        let image: Upload
        let pdf: Upload
        try {
            image = await this.storePosterAsset(files, poster, 'image')
            pdf = await this.storePosterAsset(files, poster, 'pdf')

            return {
                image,
                pdf,
            }
        } catch (error) {
            this.logger.error(error.message, error.stack, error)
            if (image) await this.uploadsService.deleteUpload(image)
            if (pdf) await this.uploadsService.deleteUpload(pdf)
            throw new InternalServerErrorException(
                'Error while saving poster assets',
            )
        }
    }

    private async storePosterAsset(
        files: MulterS3FileRecord,
        data: PosterAssets,
        key: 'image' | 'pdf',
    ): Promise<Upload> | null {
        if (files) {
            const multerFile = this.getMulterFile(files, key)
            if (multerFile) {
                if (data[key]?.id) multerFile.id = data[key].id
                return this.uploadsService.save(multerFile)
            }
        } else {
            return null
        }
    }

    private getMulterFile(files: MulterS3FileRecord, key: string): UploadSave {
        return Array.isArray(files[key]) ? files[key][0] : null
    }

    /**
     *
     * @param poster Poster with the authors
     * @param sendEmail If true the new users will be notified
     * @returns
     */
    async posterAuthorsToUsers(
        poster: PosterAuthorsToUsersArgs,
        sendEmail = true,
    ): Promise<User[]> {
        const authors: SanitizedUserDto[] = uniqBy(poster.authors, 'email')

        const processedUsers: User[] = []
        for await (const author of authors) {
            let currentAuthor: User = await this.usersService.findUnique({
                email: author.email,
            })

            // Author is not a user
            if (!currentAuthor) {
                // Make user
                currentAuthor = await this.handleNewUser(
                    poster,
                    author,
                    sendEmail,
                )
            }

            processedUsers.push(currentAuthor)
        }

        return processedUsers
    }

    private async handleNewUser(
        poster: HandleNewUserArgs,
        author: SanitizedUserDto,
        sendEmail: boolean,
    ): Promise<User> {
        const { tenant, user: documentOwner, title } = poster
        const userAuthor = await this.usersService.createDummyUser(author)

        // Send invitation email to new user
        if (sendEmail) {
            const registerEmailURL = await this.getRegisterUrl(
                tenant,
                userAuthor,
            )
            const mail = new AuthorInvitationMail({
                mainAuthorFullName:
                    documentOwner.firstName + ' ' + documentOwner.lastName,
                coAuthorFullName:
                    userAuthor.firstName + ' ' + userAuthor.lastName,
                documentTitle: title,
                tenantName: tenant.name,
                actionUrl: registerEmailURL,
            })

            await this.mailService.sendMail(mail, author.email, tenant.id)
        }

        return userAuthor
    }

    private async getRegisterUrl(
        tenant: Tenant,
        userAuthor: Pick<
            User,
            'email' | 'firstName' | 'lastName' | 'organizationName'
        >,
    ) {
        const origin = await this.tenantService.findTenantUrl(tenant)
        return `${origin}/auth/register?email=${userAuthor.email}&firstName=${userAuthor.firstName}&lastName=${userAuthor.lastName}&organizationName=${userAuthor.organizationName}`
    }
}
