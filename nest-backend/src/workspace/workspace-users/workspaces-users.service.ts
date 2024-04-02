import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
    WorkspaceUserFindMany,
    workspaceUserFindManyWithFilter,
} from '@/iam/users/user.repository'
import { omit } from 'lodash'
import { Role, Workspace, WorkspaceVisibilityEnum } from '@prisma/client'
import { WorkspaceRoleEnum } from '@/access-control/roles/default-roles.service'
import { RoleDomain } from '@/access-control/rules/rules.constants'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { RulesService } from '@/access-control/rules/rules.service'
import {
    AccessControlRules,
    FeaturesEnum,
} from '@/access-control/access-control.types'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'

export interface UserWithRoles {
    id: number
    firstName: string
    lastName: string
    organizationName: string
    biography: string
    currentPosition: string
    roles: Role[]
}

@Injectable()
export class WorkspacesUsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersRolesService: UsersRolesService,
        private readonly rulesService: RulesService,
    ) {}

    async findUsers(workspaceId: number): Promise<UserWithRoles[]> {
        const users = await this.prisma.user.findMany({
            where: {
                workspaces: {
                    some: { id: workspaceId },
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                organizationName: true,
                biography: true,
                currentPosition: true,
                workspaces: true,
                roles: {
                    where: {
                        role: {
                            domain: RoleDomain.Workspace(workspaceId),
                        },
                    },
                    include: {
                        role: true,
                    },
                },
            },
        })

        const mapUsers = []
        for (const user of users) {
            mapUsers.push({
                ...user,
                roles: user.roles.map((roleToUser) => roleToUser.role),
            })
        }

        return mapUsers
    }

    // This should only return information about the users related with this workspace
    async findOneUser(
        userId: number,
        workspaceId: number,
        authenticatedUserData: SanitizedUserDto,
    ): Promise<Omit<WorkspaceUserFindMany, 'workspaces'>> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            ...workspaceUserFindManyWithFilter(
                userId !== authenticatedUserData.id,
            ),
        })

        const isTheUserInTheWorkspace = user.workspaces.find(
            (w) => w.id === workspaceId,
        )

        if (!isTheUserInTheWorkspace)
            throw new NotFoundException(
                `Could not find a user with Id ${userId} inside the workspace ${workspaceId}`,
            )

        return omit(user, ['workspaces'] as const)
    }

    async removeUserFromWorkspace(
        authUser: SanitizedUserDto,
        data: {
            userId: number
            workspaceId: number
        },
    ): Promise<void> {
        const { workspaceId, userId } = data

        await this.validateWorkspaceIsValid(workspaceId, authUser)

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                roles: {
                    include: {
                        role: true,
                    },
                    where: {
                        role: {
                            domain: RoleDomain.Workspace(workspaceId),
                        },
                    },
                },
            },
        })

        if (user.roles.length === 0)
            throw new Error('User have no role in this workspace')

        const role: Role = user.roles.find(
            (r) => r.role.domain === RoleDomain.Workspace(workspaceId),
        )?.role

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                workspaces: {
                    disconnect: {
                        id: workspaceId,
                    },
                },
                roles: {
                    delete: {
                        roleId_userId: {
                            userId,
                            roleId: role.id,
                        },
                    },
                },
            },
        })
    }

    private async validateWorkspaceIsValid(
        workspaceId: number,
        authUser: { id: number },
    ) {
        const rules = await this.rulesService.findAllRulesOfUser({
            feature: FeaturesEnum.AccessControl,
            name: AccessControlRules.updateUserRole,
            options: {
                domain: RoleDomain.Workspace(workspaceId),
            },
            userId: authUser.id,
        })

        console.log(rules)

        if (rules.length === 0)
            throw new ForbiddenException(
                'User is not authorized to remove another user from this workspace',
            )
    }

    /**
     * Adds a user to workspace. Is role is not specified it defaults to the MEMBER role of the workspace
     * @param userId
     * @param workspace
     * @param role
     */
    async addUserToWorkspace(
        userId: number,
        workspace: Workspace,
        role: string | number = WorkspaceRoleEnum.MEMBER,
    ): Promise<void> {
        let roleId: number
        if (typeof role === 'string') {
            // TODO: Should find any Role by name.
            //      This useful for the system roles: GUEST. MEMBER. ADMIN, OWNER
            const memberRole = await this.findMemberRoleInWorkspace(workspace)
            roleId = memberRole.id
        } else {
            roleId = role
        }
        await this.assignUserToWorkspace(userId, workspace)
        await this.updateWorkspaceRoleOfUser(userId, workspace.id, roleId)
    }

    async assignUserToWorkspace(
        userId: number,
        workspace: Workspace,
    ): Promise<void> {
        if (!workspace)
            throw new InternalServerErrorException('Workspace Id is not valid')

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                workspaces: {
                    include: {
                        tenant: true,
                    },
                },
            },
        })

        if (!user)
            throw new InternalServerErrorException('User Id is not valid')

        // const oldWorkSpaceList =
        //     user.workspaces.length > 0
        //         ? user.workspaces.map((w) => ({
        //               id: w.id,
        //           }))
        //         : []
        //
        // oldWorkSpaceList.push({ id: workspace.id })

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                workspaces: {
                    // set: [],
                    // connect: oldWorkSpaceList,
                    connect: {
                        id: workspace.id,
                    },
                },
            },
        })
    }

    async findMemberRoleInWorkspace(workspace: Workspace): Promise<Role> {
        return await this.prisma.role.findUnique({
            where: {
                name_tenantId_domain: {
                    name: WorkspaceRoleEnum.MEMBER,
                    domain: RoleDomain.Workspace(workspace.id),
                    tenantId: workspace.tenantId,
                },
            },
        })
    }

    async findWorkspacesToBeLinkedWithUser(
        userId: number,
    ): Promise<Workspace[]> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                workspaces: {
                    include: {
                        tenant: true,
                    },
                },
                userDirectories: true,
            },
        })

        // For example a user with a local account that was not invite anywhere else
        if (user.userDirectories.length === 0) return []

        const userDirectoryIdsOfTheUser: number[] = user.userDirectories.map(
            (x) => x.id,
        )

        // Fetch all PUBLIC workspaces of the tenants from which the user is a member
        // Only way for the user to be a member currently is because the domain of the email
        // of the user matches the tenant's domain, or he is using an IdP for that tenant
        const workspaces =
            await this.findWorkspacesOfTenantThatMatchesUserDirectory(
                userDirectoryIdsOfTheUser,
            )

        return this.getWorkspacesTheUserIsNotMember(workspaces, user)
    }

    async findWorkspacesOfTenantThatMatchesUserDirectory(
        userDirectoryIdsOfTheUser: number[],
    ): Promise<Workspace[]> {
        return this.prisma.workspace.findMany({
            where: {
                visibility: WorkspaceVisibilityEnum.PUBLIC,
                tenant: {
                    userDirectory: {
                        id: {
                            in: userDirectoryIdsOfTheUser,
                        },
                    },
                },
            },
        })
    }

    private getWorkspacesTheUserIsNotMember(
        workspacesOfTenantThatMatchesUserDirectory,
        user,
    ) {
        const workspaceList: Workspace[] = []

        if (workspacesOfTenantThatMatchesUserDirectory.length > 0) {
            const workspacesIdOfTheUser = user.workspaces.map((x) => x.id)

            for (const workspace of workspacesOfTenantThatMatchesUserDirectory) {
                const isUserInTheWorkspace = workspacesIdOfTheUser.includes(
                    workspace.id,
                )
                if (!isUserInTheWorkspace) workspaceList.push(workspace)
            }
            return workspaceList
        }

        return workspaceList
    }

    async updateWorkspaceRoleOfUser(
        userId: number,
        workspaceId: number,
        roleId: number,
    ): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        if (!user)
            throw new InternalServerErrorException('User Id does not exists')

        const roles = await this.prisma.role.findMany({
            where: {
                domain: RoleDomain.Workspace(workspaceId),
            },
        })

        if (roles.findIndex((role) => role.id === roleId) === -1)
            throw new InternalServerErrorException(
                'Role ID does not match the roles in the Workspace',
            )

        await this.usersRolesService.upsertRoleOfUser(userId, roleId)
    }
}
