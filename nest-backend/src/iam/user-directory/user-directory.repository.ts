import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, UserDirectory, IdentityProvider, User } from '@prisma/client'

@Injectable()
export class UserDirectoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        input: Prisma.UserDirectoryCreateInput,
    ): Promise<UserDirectory> {
        return this.prisma.userDirectory.create({
            data: input,
        })
    }

    async findOne(
        where: Prisma.UserDirectoryWhereUniqueInput,
    ): Promise<UserDirectory & { users: User[] }> {
        return this.prisma.userDirectory.findUnique({
            where,
            include: {
                users: true,
            },
        })
    }

    async findFirst(where: Prisma.UserDirectoryWhereInput): Promise<
        UserDirectory & {
            users: User[]
            guestUsers: User[]
            identityProvider: IdentityProvider[]
        }
    > {
        return this.prisma.userDirectory.findFirst({
            where,
            include: {
                users: true,
                guestUsers: true,
                identityProvider: true,
            },
        })
    }

    async findMany(
        where: Prisma.UserDirectoryWhereInput,
    ): Promise<(UserDirectory & { users: User[]; guestUsers: User[] })[]> {
        return this.prisma.userDirectory.findMany({
            where,
            include: {
                users: true,
                guestUsers: true,
            },
        })
    }

    async update(
        where: Prisma.UserDirectoryWhereUniqueInput,
        data: Prisma.UserDirectoryUpdateInput,
    ): Promise<UserDirectory> {
        return this.prisma.userDirectory.update({
            where: where,
            data: data,
        })
    }
}
