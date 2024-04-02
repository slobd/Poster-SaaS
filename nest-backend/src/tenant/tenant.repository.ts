import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Tenant } from '@prisma/client'
import { Injectable } from '@nestjs/common'

const tenantWithFeatures = Prisma.validator<Prisma.TenantArgs>()({
    include: {
        features: true,
    },
})

export type TenantWithFeatures = Prisma.TenantGetPayload<
    typeof tenantWithFeatures
>

const tenantWithFeaturesAndOwner = Prisma.validator<Prisma.TenantArgs>()({
    include: {
        features: true,
        owner: true,
    },
})

export type TenantWithFeaturesAndOwner = Prisma.TenantGetPayload<
    typeof tenantWithFeaturesAndOwner
>

@Injectable()
export class TenantRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findUnique(
        where: Prisma.TenantWhereUniqueInput,
    ): Promise<TenantWithFeatures> {
        return this.prisma.tenant.findUnique({
            where,
            ...tenantWithFeatures,
        })
    }

    async findTenantByOrigin(origin: string): Promise<Tenant> {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                host: origin,
            },
            include: {
                logo: true,
            },
        })

        if (!tenant) return null

        return tenant
    }

    async findOneById(id: number): Promise<TenantWithFeatures> {
        return this.prisma.tenant.findUnique({
            where: { id },
            include: {
                features: true,
            },
        })
    }

    async create(tenantData: Prisma.TenantCreateInput): Promise<Tenant> {
        return this.prisma.tenant.create({
            data: tenantData,
        })
    }
}
