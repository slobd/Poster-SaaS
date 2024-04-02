import { Injectable } from '@nestjs/common'
import {
    CreateWorkspaceArgs,
    WorkspaceRepository,
    WorkspaceWithTenant,
} from '@/workspace/workspace.repository'
import {
    DefaultRolesService,
    TenantRoleEnum,
} from '@/access-control/roles/default-roles.service'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { User } from '@prisma/client'
import { RoleWithRules } from '@/access-control/entities/role.entity'

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly workspaceRepository: WorkspaceRepository,
        private readonly defaultRolesService: DefaultRolesService,
        private readonly usersRolesService: UsersRolesService,
    ) {}

    async create(
        data: CreateWorkspaceArgs,
        owner: User,
    ): Promise<WorkspaceWithTenant> {
        const workspace = await this.workspaceRepository.create(data)

        const roles = await this.defaultRolesService.createWorkspaceRoles(
            workspace,
        )

        const ownerRole = this.getOwnerRole(roles)

        await this.usersRolesService.giveRoleToUser(owner.id, ownerRole.id)

        return workspace
    }

    private getOwnerRole(roles: RoleWithRules[]) {
        return roles.find((r) => r.name === TenantRoleEnum.OWNER)
    }
}
