import { Injectable, NotImplementedException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import {
    RoleWithRules,
    SystemCreateRoleDto,
    UpdateRoleDto,
} from '@/access-control/entities/role.entity'
import { getRuleCreateManyInput } from '@/access-control/rules/rules.service'
import { Tenant } from '@/tenant/entities/tenant.entity'

@Injectable()
export class RolesService {
    constructor(private readonly prisma: PrismaService) {}

    async createRole(
        role: SystemCreateRoleDto,
        tenant: Tenant,
    ): Promise<RoleWithRules> {
        return this.prisma.role.create({
            data: {
                name: role.name,
                description: role.description,
                domain: role.domain,
                system: role.system,
                tenant: {
                    connect: {
                        id: tenant.id,
                    },
                },
                rules: {
                    createMany: {
                        data: getRuleCreateManyInput(role.rules),
                    },
                },
            },
            include: {
                rules: true,
            },
        })
    }

    async findOneRole(): Promise<RoleWithRules> {
        throw new NotImplementedException()
    }

    async findManyRoles(
        where: Prisma.RoleWhereInput,
    ): Promise<RoleWithRules[]> {
        return this.prisma.role.findMany({
            where,
            include: {
                rules: true,
            },
        })
    }

    async updateRole(role: UpdateRoleDto): Promise<RoleWithRules> {
        await this.deleteRoleRules(role.id)

        return this.prisma.role.update({
            where: {
                id: role.id,
            },
            data: {
                ...role,
                rules: {
                    createMany: {
                        data: getRuleCreateManyInput(role.rules),
                    },
                },
            },
            include: {
                rules: true,
            },
        })
    }

    private async deleteRoleRules(id: number) {
        return this.prisma.role.update({
            where: {
                id: id,
            },
            data: {
                rules: {
                    deleteMany: {},
                },
            },
        })
    }
}
