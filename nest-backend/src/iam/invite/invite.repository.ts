import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Invite } from '@prisma/client'

@Injectable()
export class InviteRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(where: Prisma.InviteWhereUniqueInput): Promise<Invite> {
        return this.prisma.invite.findUnique({
            where,
        })
    }

    async findMany(where: Prisma.InviteWhereInput): Promise<Invite[]> {
        return this.prisma.invite.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                workspace: {
                    select: {
                        tenantId: true,
                    },
                },
            },
        })
    }

    async create(data: Prisma.InviteCreateInput): Promise<Invite> {
        return this.prisma.invite.create({
            data,
        })
    }

    async update(
        where: Prisma.InviteWhereUniqueInput,
        data: Prisma.InviteUpdateInput,
    ): Promise<Invite> {
        return this.prisma.invite.update({
            where,
            data,
        })
    }
    async delete(where: Prisma.InviteWhereUniqueInput): Promise<Invite> {
        return this.prisma.invite.delete({
            where,
        })
    }
}
