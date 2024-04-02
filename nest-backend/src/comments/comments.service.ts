import { NewCommentMail } from '@/mail/mailables/new-comment.mail'
import { MailService } from '@/mail/mail.service'
import { CreateCommentData } from './dto/create-comment.dto'
import { UsersService } from '@/iam/users/users.service'
import { Injectable } from '@nestjs/common'
import { TenantService } from '@/tenant/tenant.service'
import { Tenant } from '@/tenant/entities/tenant.entity'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'

export const commentFindOne = Prisma.validator<Prisma.CommentArgs>()({
    include: {
        poster: {
            select: {
                id: true,
                title: true,
                user: true,
            },
        },
        user: true,
    },
})

export type CommentFindOne = Prisma.CommentGetPayload<typeof commentFindOne>

export const commentFindMany = Prisma.validator<Prisma.CommentArgs>()({
    select: {
        id: true,
        content: true,
        createdAt: true,
        posterId: true,
        poster: {
            select: {
                id: true,
                title: true,
                createdAt: true,
                workspaceId: true,
            },
        },
        user: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        },
    },
})

export type CommentFindMany = Prisma.CommentGetPayload<typeof commentFindMany>

@Injectable()
export class CommentsService {
    constructor(
        readonly usersService: UsersService,
        readonly mailService: MailService,
        readonly tenantService: TenantService,
        private readonly prisma: PrismaService,
    ) {}

    async findOne(id: number): Promise<CommentFindOne> {
        const comment = await this.prisma.comment.findUnique({
            where: {
                id,
            },
            ...commentFindOne,
        })
        const author = await this.usersService.findUnique({
            id: comment.user.id,
        })
        const res = {
            ...comment,
            author: author,
            poster: {
                ...comment.poster,
                user: comment.poster.user,
            },
        }

        return res
    }

    async find(posterId: number): Promise<CommentFindMany[]> {
        return this.prisma.comment.findMany({
            where: {
                posterId: posterId,
            },
            ...commentFindMany,
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    async create(
        data: CreateCommentData,
        tenant: Tenant,
        userId: number,
    ): Promise<CommentFindOne> {
        try {
            const createBody = {
                content: data.content,
                user: {
                    connect: {
                        id: data.author.id,
                    },
                },
                poster: {
                    connect: {
                        id: data.posterId,
                    },
                },
            }
            const { id } = await this.prisma.comment.create({
                data: createBody,
            })
            const comment = await this.findOne(id)

            // Only send email if poster author allows it and is different from actual user.
            if (
                !comment?.poster?.user.disableNotifications &&
                userId !== comment.poster.user.id
            )
                await this.notifyAuthor(comment, tenant)
            return comment
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async update(
        data: Prisma.CommentUpdateInput,
        where: Prisma.CommentWhereUniqueInput,
    ): Promise<CommentFindOne> {
        try {
            await this.prisma.comment.update({
                where,
                data,
            })
            return this.findOne(where.id)
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async delete(id: number): Promise<void> {
        await this.prisma.comment.delete({
            where: { id },
        })
    }

    private async notifyAuthor(
        comment: CommentFindOne,
        tenant: Tenant,
    ): Promise<void> {
        const {
            id,
            content,
            user: { firstName, lastName },
            poster,
        } = comment

        const origin = await this.tenantService.findTenantUrl(tenant)
        await this.mailService.sendMail(
            new NewCommentMail({
                authorFirstName: poster.user.firstName,
                commenterName: firstName + ' ' + lastName,
                posterTitle: poster.title,
                content,
                actionUrl: this.createNewCommentURL(origin, poster.id, id),
            }),
            poster.user.email,
            tenant.id,
        )
    }

    private createNewCommentURL(
        origin: string,
        poster: number,
        comment: number,
    ): string {
        // <base_url>/gallery/<posterId>/info#comment_<commentId>
        return `${origin}/gallery/${poster}/info#comment_${comment}`
    }
}
