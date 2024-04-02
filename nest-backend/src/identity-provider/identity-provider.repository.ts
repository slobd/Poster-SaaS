import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { IdentityProvider, Prisma } from '@prisma/client'

@Injectable()
export class IdentityProviderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(
        where: Prisma.IdentityProviderWhereUniqueInput,
    ): Promise<IdentityProvider> {
        return this.prisma.identityProvider.findUnique({
            where,
        })
    }

    async findAll(
        where: Prisma.IdentityProviderWhereInput,
    ): Promise<IdentityProvider[]> {
        return this.prisma.identityProvider.findMany({
            where,
        })
    }

    async create(data: Prisma.IdentityProviderCreateInput) {
        return this.prisma.identityProvider.create({
            data,
        })
    }
}
