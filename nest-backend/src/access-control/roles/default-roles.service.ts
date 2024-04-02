import { RolesService } from '@/access-control/roles/roles.service'
import { getRulesForDefaultRoles } from '@/access-control/rules/rules.service'
import {
    FeaturesRules,
    RoleDomain,
} from '@/access-control/rules/rules.constants'
import {
    CreateRoleDto,
    RoleWithRules,
} from '@/access-control/entities/role.entity'
import { Tenant } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { WorkspaceWithTenant } from '@/workspace/workspace.repository'

export enum TenantRoleEnum {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    MEMBER = 'Member',
}

export enum WorkspaceRoleEnum {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    MEMBER = 'Member',
    GUEST = 'Guest',
}

export type GetWorkspaceRolesTemplateParam = {
    domain?: string
    workspace?: {
        id: number | string
    }
    tenant?: {
        id: number | string
    }
}

export type GetTenantRolesTemplateParam = {
    domain?: string
    tenant?: {
        id: number | string
    }
}

@Injectable()
export class DefaultRolesService {
    constructor(private readonly rolesService: RolesService) {}

    async createTenantRoles(tenant: Tenant): Promise<RoleWithRules[]> {
        const interpolatedRoles = this.getTenantRoles(tenant)
        const roles: RoleWithRules[] = []
        for (const interpolatedRole of interpolatedRoles) {
            const role = await this.rolesService.createRole(
                interpolatedRole,
                tenant,
            )
            roles.push(role)
        }
        return roles
    }

    getTenantRoles(tenant: Tenant): (CreateRoleDto & { system: boolean })[] {
        const domain = RoleDomain.Tenant(tenant.id)

        return this.getTenantRolesTemplate({
            domain,
            tenant,
        })
    }

    /**
     * Changing the order of the role's properties or the order of the rules will trigger a migration
     */
    getTenantRolesTemplate({
        domain = '<%= domain %>',
        tenant = { id: '<%= tenant.id %>' },
    }: GetTenantRolesTemplateParam): (CreateRoleDto & { system: boolean })[] {
        const tenantId = tenant.id as number
        return [
            {
                name: TenantRoleEnum.OWNER,
                domain,
                description: 'Default owner role',
                system: true,
                rules: getRulesForDefaultRoles([
                    // Tenant Management
                    [
                        FeaturesRules.TenantManagement.updateBasicInfo,
                        { tenantId },
                    ],

                    //Workspace
                    [FeaturesRules.Workspace.createWorkspace, { tenantId }],

                    [FeaturesRules.Workspace.readWorkspace, { tenantId }],
                    [FeaturesRules.Workspace.updateWorkspace, { tenantId }],
                    [FeaturesRules.Workspace.deleteWorkspace, { tenantId }],

                    // Workspace User Management
                    [
                        FeaturesRules.Workspace.inviteUsersToWorkspace,
                        { tenantId },
                    ],
                    [FeaturesRules.Workspace.listWorkspaceUsers, { tenantId }],

                    // Access Control
                    [FeaturesRules.AccessControl.listRoles, {}],
                    [
                        FeaturesRules.AccessControl.readRole,
                        { domain: RoleDomain.Tenant(tenantId) },
                    ],
                    [
                        FeaturesRules.AccessControl.updateUserRole,
                        { domain: RoleDomain.Tenant(tenantId) },
                    ],
                    // Invite
                    [
                        FeaturesRules.Invite.readWorkspacePublicInvite,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Invite.updateWorkspacePublicInvite,
                        { tenantId },
                    ],
                    // Project
                    [FeaturesRules.Project.createProject, { tenantId }],
                    [FeaturesRules.Project.listProjects, { tenantId }],
                    [FeaturesRules.Project.readProject, { tenantId }],
                    [FeaturesRules.Project.updatePublicProject, { tenantId }],
                    [FeaturesRules.Project.deletePublicProject, { tenantId }],
                    // People
                    [FeaturesRules.People.listWorkspaceUsers, { tenantId }],
                    [FeaturesRules.People.readWorkspaceUser, { tenantId }],
                    // Gallery
                    [FeaturesRules.Gallery.createPoster, { tenantId }],
                    [FeaturesRules.Gallery.listPosters, { tenantId }],
                    [FeaturesRules.Gallery.readPoster, { id: '*', tenantId }],
                    [FeaturesRules.Gallery.updatePoster, { id: '*', tenantId }],
                    [FeaturesRules.Gallery.deletePoster, { id: '*', tenantId }],
                    [FeaturesRules.Comment.createComment, { tenantId }],
                    [FeaturesRules.Comment.listComments, { tenantId }],
                    [
                        FeaturesRules.Comment.deleteCommentOfWorkspace,
                        { tenantId },
                    ],
                    // Board
                    [
                        FeaturesRules.Board.createBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.updateBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.readBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.deleteBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.createTaskOfPublicProject,
                        { tenantId },
                    ],
                    [FeaturesRules.Board.readTaskOfPublicProject, { tenantId }],
                    [
                        FeaturesRules.Board.updateTaskOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.deleteTaskOfPublicProject,
                        { tenantId },
                    ],
                ]),
            },
            {
                name: TenantRoleEnum.ADMIN,
                domain,
                description: 'Default admin role',
                system: true,
                rules: getRulesForDefaultRoles([
                    // Tenant Management
                    [
                        FeaturesRules.TenantManagement.updateBasicInfo,
                        { tenantId },
                    ],
                    //Workspace
                    [FeaturesRules.Workspace.createWorkspace, { tenantId }],

                    [FeaturesRules.Workspace.readWorkspace, { tenantId }],
                    [FeaturesRules.Workspace.updateWorkspace, { tenantId }],
                    [FeaturesRules.Workspace.deleteWorkspace, { tenantId }],

                    // Workspace User Management
                    [
                        FeaturesRules.Workspace.inviteUsersToWorkspace,
                        { tenantId },
                    ],
                    [FeaturesRules.Workspace.listWorkspaceUsers, { tenantId }],
                    // Access Control
                    [FeaturesRules.AccessControl.listRoles, {}],
                    [
                        FeaturesRules.AccessControl.readRole,
                        { domain: RoleDomain.Tenant(tenantId) },
                    ],
                    [
                        FeaturesRules.AccessControl.updateUserRole,
                        { domain: RoleDomain.Tenant(tenantId) },
                    ],
                    // Invite
                    [
                        FeaturesRules.Invite.readWorkspacePublicInvite,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Invite.updateWorkspacePublicInvite,
                        { tenantId },
                    ],
                    // Project
                    [FeaturesRules.Project.createProject, { tenantId }],
                    [FeaturesRules.Project.listProjects, { tenantId }],
                    [FeaturesRules.Project.readProject, { tenantId }],
                    [FeaturesRules.Project.updatePublicProject, { tenantId }],
                    [FeaturesRules.Project.deletePublicProject, { tenantId }],
                    // People
                    [FeaturesRules.People.listWorkspaceUsers, { tenantId }],
                    [FeaturesRules.People.readWorkspaceUser, { tenantId }],
                    // Gallery
                    [FeaturesRules.Gallery.createPoster, { tenantId }],
                    [FeaturesRules.Gallery.listPosters, { tenantId }],
                    [FeaturesRules.Gallery.readPoster, { id: '*', tenantId }],
                    [FeaturesRules.Gallery.updatePoster, { id: '*', tenantId }],
                    [FeaturesRules.Gallery.deletePoster, { id: '*', tenantId }],
                    [FeaturesRules.Comment.createComment, { tenantId }],
                    [FeaturesRules.Comment.listComments, { tenantId }],
                    [
                        FeaturesRules.Comment.deleteCommentOfWorkspace,
                        { tenantId },
                    ],
                    // Board
                    [
                        FeaturesRules.Board.createBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.updateBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.readBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.deleteBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.createTaskOfPublicProject,
                        { tenantId },
                    ],
                    [FeaturesRules.Board.readTaskOfPublicProject, { tenantId }],
                    [
                        FeaturesRules.Board.updateTaskOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.deleteTaskOfPublicProject,
                        { tenantId },
                    ],
                ]),
            },
            {
                name: TenantRoleEnum.MEMBER,
                domain,
                description: 'Default member role',
                system: true,
                rules: getRulesForDefaultRoles([
                    [FeaturesRules.Workspace.readWorkspace, { tenantId }],
                    [FeaturesRules.Workspace.createWorkspace, { tenantId }],
                    // Project
                    [FeaturesRules.Project.listProjects, { tenantId }],
                    [FeaturesRules.Project.readProject, { tenantId }],
                    [FeaturesRules.Project.updatePublicProject, { tenantId }],
                    // People
                    [FeaturesRules.People.listWorkspaceUsers, { tenantId }],
                    [FeaturesRules.People.readWorkspaceUser, { tenantId }],
                    // Gallery
                    [FeaturesRules.Gallery.createPoster, { tenantId }],
                    [FeaturesRules.Gallery.listPosters, { tenantId }],
                    [FeaturesRules.Gallery.readPoster, { id: '*', tenantId }],
                    [FeaturesRules.Comment.createComment, { tenantId }],
                    [FeaturesRules.Comment.listComments, { tenantId }],
                    // Board
                    [
                        FeaturesRules.Board.readBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.createTaskOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.updateBoardOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.deleteBoardOfPublicProject,
                        { tenantId },
                    ],
                    [FeaturesRules.Board.readTaskOfPublicProject, { tenantId }],
                    [
                        FeaturesRules.Board.updateTaskOfPublicProject,
                        { tenantId },
                    ],
                    [
                        FeaturesRules.Board.deleteTaskOfPublicProject,
                        { tenantId },
                    ],
                ]),
            },
        ]
    }

    async createWorkspaceRoles(
        workspace: WorkspaceWithTenant,
    ): Promise<RoleWithRules[]> {
        const interpolatedRoles = this.getWorkspaceRoles(workspace)
        const roles: RoleWithRules[] = []
        for (const interpolatedRole of interpolatedRoles) {
            const role = await this.rolesService.createRole(
                interpolatedRole,
                workspace.tenant,
            )
            roles.push(role)
        }
        return roles
    }

    getWorkspaceRoles(
        workspace: WorkspaceWithTenant,
    ): (CreateRoleDto & { system: boolean })[] {
        const domain = RoleDomain.Workspace(workspace.id)
        return this.getWorkspaceRolesTemplate({
            domain,
            workspace,
        })
    }

    /**
     * Changing the order of the role's properties or the order of the rules will trigger a migration
     */
    getWorkspaceRolesTemplate({
        domain = '<%= domain %>',
        workspace = { id: '<%= workspace.id %>' },
    }: GetWorkspaceRolesTemplateParam): (CreateRoleDto & {
        system: boolean
    })[] {
        const workspaceId = workspace.id as number
        return [
            {
                name: WorkspaceRoleEnum.OWNER,
                domain,
                description: 'Default owner role',
                system: true,
                rules: getRulesForDefaultRoles([
                    // Workspace
                    [FeaturesRules.Workspace.readWorkspace, { workspaceId }],
                    [FeaturesRules.Workspace.updateWorkspace, { workspaceId }],

                    // Workspace User Management
                    [
                        FeaturesRules.Workspace.inviteUsersToWorkspace,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Workspace.listWorkspaceUsers,
                        { workspaceId },
                    ],

                    // Access Control
                    [FeaturesRules.AccessControl.listRoles, {}],
                    [
                        FeaturesRules.AccessControl.readRole,
                        { domain: RoleDomain.Workspace(workspaceId) },
                    ],
                    [
                        FeaturesRules.AccessControl.updateUserRole,
                        { domain: RoleDomain.Workspace(workspaceId) },
                    ],

                    // Invite
                    [
                        FeaturesRules.Invite.readWorkspacePublicInvite,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Invite.updateWorkspacePublicInvite,
                        { workspaceId },
                    ],

                    // Project
                    [FeaturesRules.Project.createProject, { workspaceId }],
                    [FeaturesRules.Project.listProjects, { workspaceId }],
                    [FeaturesRules.Project.readProject, { workspaceId }],
                    [
                        FeaturesRules.Project.updatePublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Project.deletePublicProject,
                        { workspaceId },
                    ],

                    // People
                    [FeaturesRules.People.listWorkspaceUsers, { workspaceId }],
                    [FeaturesRules.People.readWorkspaceUser, { workspaceId }],

                    // Gallery
                    [FeaturesRules.Gallery.createPoster, { workspaceId }],
                    [FeaturesRules.Gallery.listPosters, { workspaceId }],
                    [
                        FeaturesRules.Gallery.readPoster,
                        { workspaceId, id: '*' },
                    ],
                    [
                        FeaturesRules.Gallery.updatePoster,
                        { workspaceId, id: '*' },
                    ],
                    [
                        FeaturesRules.Gallery.deletePoster,
                        { workspaceId, id: '*' },
                    ],
                    [FeaturesRules.Comment.createComment, { workspaceId }],
                    [FeaturesRules.Comment.listComments, { workspaceId }],
                    [
                        FeaturesRules.Comment.deleteCommentOfWorkspace,
                        { workspaceId },
                    ],

                    // Board
                    [
                        FeaturesRules.Board.readBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.createBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.deleteBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.updateBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.createTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.readTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.updateTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.deleteTaskOfPublicProject,
                        { workspaceId },
                    ],
                ]),
            },
            {
                name: WorkspaceRoleEnum.ADMIN,
                domain,
                description: 'Default admin role',
                system: true,
                rules: getRulesForDefaultRoles([
                    // Workspace
                    [FeaturesRules.Workspace.readWorkspace, { workspaceId }],
                    [FeaturesRules.Workspace.updateWorkspace, { workspaceId }],

                    // Workspace User Management
                    [
                        FeaturesRules.Workspace.inviteUsersToWorkspace,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Workspace.listWorkspaceUsers,
                        { workspaceId },
                    ],

                    // Access Control
                    [FeaturesRules.AccessControl.listRoles, {}],
                    [
                        FeaturesRules.AccessControl.readRole,
                        { domain: RoleDomain.Workspace(workspaceId) },
                    ],
                    [
                        FeaturesRules.AccessControl.updateUserRole,
                        { domain: RoleDomain.Workspace(workspaceId) },
                    ],

                    // Invite
                    [
                        FeaturesRules.Invite.readWorkspacePublicInvite,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Invite.updateWorkspacePublicInvite,
                        { workspaceId },
                    ],

                    // Project
                    [FeaturesRules.Project.createProject, { workspaceId }],
                    [FeaturesRules.Project.listProjects, { workspaceId }],
                    [FeaturesRules.Project.readProject, { workspaceId }],
                    [
                        FeaturesRules.Project.updatePublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Project.deletePublicProject,
                        { workspaceId },
                    ],

                    // People
                    [FeaturesRules.People.listWorkspaceUsers, { workspaceId }],
                    [FeaturesRules.People.readWorkspaceUser, { workspaceId }],

                    // Gallery
                    [FeaturesRules.Gallery.createPoster, { workspaceId }],
                    [FeaturesRules.Gallery.listPosters, { workspaceId }],
                    [
                        FeaturesRules.Gallery.readPoster,
                        { workspaceId, id: '*' },
                    ],
                    [
                        FeaturesRules.Gallery.updatePoster,
                        { workspaceId, id: '*' },
                    ],
                    [
                        FeaturesRules.Gallery.deletePoster,
                        { workspaceId, id: '*' },
                    ],
                    [FeaturesRules.Comment.createComment, { workspaceId }],
                    [FeaturesRules.Comment.listComments, { workspaceId }],
                    [
                        FeaturesRules.Comment.deleteCommentOfWorkspace,
                        { workspaceId },
                    ],

                    // Board
                    [
                        FeaturesRules.Board.readBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.createBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.updateBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.deleteBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.createTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.readTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.updateTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.deleteTaskOfPublicProject,
                        { workspaceId },
                    ],
                ]),
            },
            {
                name: WorkspaceRoleEnum.MEMBER,
                domain,
                description: 'Default member role',
                system: true,
                rules: getRulesForDefaultRoles([
                    // Workspace
                    [FeaturesRules.Workspace.readWorkspace, { workspaceId }],

                    // Project
                    [FeaturesRules.Project.listProjects, { workspaceId }],
                    [FeaturesRules.Project.readProject, { workspaceId }],
                    [
                        FeaturesRules.Project.updatePublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Project.deletePublicProject,
                        { workspaceId },
                    ],

                    // People
                    [FeaturesRules.People.listWorkspaceUsers, { workspaceId }],
                    [FeaturesRules.People.readWorkspaceUser, { workspaceId }],

                    // Gallery
                    [FeaturesRules.Gallery.createPoster, { workspaceId }],
                    [FeaturesRules.Gallery.listPosters, { workspaceId }],
                    [
                        FeaturesRules.Gallery.readPoster,
                        { workspaceId, public: true },
                    ],
                    [FeaturesRules.Comment.createComment, { workspaceId }],
                    [FeaturesRules.Comment.listComments, { workspaceId }],

                    // Board
                    [
                        FeaturesRules.Board.readBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.createBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.updateBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.deleteBoardOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.createTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.readTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.updateTaskOfPublicProject,
                        { workspaceId },
                    ],
                    [
                        FeaturesRules.Board.deleteTaskOfPublicProject,
                        { workspaceId },
                    ],
                ]),
            },
            {
                name: WorkspaceRoleEnum.GUEST,
                domain,
                description: 'Default member role',
                system: true,
                rules: getRulesForDefaultRoles([
                    // Workspace
                    [FeaturesRules.Workspace.readWorkspace, { workspaceId }],

                    // Project
                    [FeaturesRules.Project.readProject, { workspaceId }],
                    [FeaturesRules.Project.listProjects, { workspaceId }],

                    // Gallery
                    [FeaturesRules.Gallery.listPosters, { workspaceId }],
                    [
                        FeaturesRules.Gallery.readPoster,
                        { workspaceId, public: true },
                    ],
                    [FeaturesRules.Comment.listComments, { workspaceId }],
                ]),
            },
        ]
    }
}
