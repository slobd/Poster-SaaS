import { ForbiddenException, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { WorkspaceRoleEnum } from '@/access-control/roles/default-roles.service'
import {
    AccessControlRules,
    FeaturesEnum,
} from '@/access-control/access-control.types'
import { RoleDomain } from '@/access-control/rules/rules.constants'
import { PrismaService } from '@/prisma/prisma.service'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { RulesService } from '@/access-control/rules/rules.service'

@Injectable()
export class WorkspacesUsersPatchHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersRolesService: UsersRolesService,
        private readonly rulesService: RulesService,
    ) {}

    async handle(
        authUser: { id: number },
        body: { userId; roleId; workspaceId },
    ): Promise<void> {
        const { userId, roleId, workspaceId } = body

        const newRole: Role = await this.findNewRole(roleId)

        // Owner role can't be given
        if (newRole.name === WorkspaceRoleEnum.OWNER) return

        /**
         * TODO: Remove with Access Control V2
         * The Policy Enforcer will validate the authenticated user can update the role of a user,
         * but it will not check if that role belongs to the domain to which user have
         * AccessControl.updateUserRole permission
         * So for example the user could give another user Admin role of another tenant
         * Therefore we have to validate the domain of the role
         */
        await this.validateRoleBelongToValidDomain(newRole, authUser)

        const user = await this.findUser(userId, workspaceId)

        const workspaceUserRole = this.getCurrentWorkspaceRole(
            user,
            workspaceId,
        )

        // Owner role can't be removed
        if (this.isOwnerRole(workspaceUserRole)) return

        await this.usersRolesService.upsertRoleOfUser(userId, newRole.id)
    }

    private async findNewRole(id: number) {
        return this.prisma.role.findUnique({
            where: { id },
        })
    }

    private async validateRoleBelongToValidDomain(
        newRole: Role,
        authUser: { id: number },
    ) {
        const rules = await this.rulesService.findAllRulesOfUser({
            feature: FeaturesEnum.AccessControl,
            name: AccessControlRules.updateUserRole,
            options: {
                domain: newRole.domain,
            },
            userId: authUser.id,
        })

        console.log(rules)

        if (rules.length === 0)
            throw new ForbiddenException(
                'User is not authorized to grant this role',
            )
    }

    private async findUser(userId: number, workspaceId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                roles: {
                    where: {
                        role: {
                            domain: `Workspace/${workspaceId}`,
                        },
                    },
                    include: {
                        role: true,
                    },
                },
            },
        })
    }

    private getCurrentWorkspaceRole(user: any, workspaceId: number) {
        return user.roles.find((r) => {
            return r.role.domain === RoleDomain.Workspace(workspaceId)
        })
    }

    private isOwnerRole(workspaceUserRole: Role) {
        return workspaceUserRole.name === WorkspaceRoleEnum.OWNER
    }
}
