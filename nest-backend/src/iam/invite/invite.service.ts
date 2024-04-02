import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { User, IdentityProvider } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'
import { TenantService } from '@/tenant/tenant.service'

@Injectable()
export class InviteService {
    constructor(
        private readonly workspacesUsersService: WorkspacesUsersService,
        private readonly prisma: PrismaService,
        private readonly tenantService: TenantService,
    ) {}

    generateInviteToken(): string {
        return crypto.randomBytes(64).toString('hex')
    }

    async handleUserInvites(
        user: User,
        identityProvider: IdentityProvider,
    ): Promise<void> {
        const userInvites = await this.findAcceptedUserInvites(user)

        if (userInvites.length === 0) return

        for (const invite of userInvites) {
            await this.handleUserInvite(invite, identityProvider, user)
        }
    }

    private async handleUserInvite(invite: any, identityProvider, user) {
        // We only handle workspace invites at the moment
        if (!invite.workspaceId) return

        const workspace = await this.prisma.workspace.findUnique({
            where: {
                id: invite.workspaceId,
            },
        })

        // Invalid workspaceId or workspaceId was not found (deleted)
        if (!workspace) {
            await this.deleteInvite(invite)
            return
        }

        const userDirectory = await this.findUserDirectoryFromWorkspaceId(
            invite.workspaceId,
        )

        // Give member role if the domain or idp matches the one from the user directory
        await this.tenantService.addUserToTenant(
            userDirectory,
            identityProvider,
            user,
        )

        /**
         * ADD USER TO WORKSPACE
         * If user got added to the user the workspace before accepting the invite (e.g. because of domain match)
         *  and then the user accepts the invite. His workspace role is going to be updated to match the one from the invite
         */
        const userIsNotInWorkspace = !(await this.isUserInWorkspace(
            user,
            workspace,
        ))

        if (userIsNotInWorkspace) {
            await this.workspacesUsersService.addUserToWorkspace(
                user.id,
                workspace,
                invite.roleId,
            )
            // await this.workspacesUsersService.assignUserToWorkspace(
            //     user.id,
            //     workspace,
            // )
            //
            // await this.workspacesUsersService.updateWorkspaceRoleOfUser(
            //     user.id,
            //     invite.workspaceId,
            //     invite.roleId,
            // )
        } else {
            await this.updateUserRoleToMatchTheInviteRole(user, invite)
        }

        await this.deleteInvite(invite)
    }

    private async updateUserRoleToMatchTheInviteRole(user, invite: any) {
        const userDoesNotHaveTheSameRoleInWorkspace =
            !(await this.userHasSameRoleInWorkspace(user.id, invite.roleId))

        if (userDoesNotHaveTheSameRoleInWorkspace)
            await this.workspacesUsersService.updateWorkspaceRoleOfUser(
                user.id,
                invite.workspaceId,
                invite.roleId,
            )
    }

    private async deleteInvite(invite: any) {
        await this.prisma.invite.delete({
            where: {
                id: invite.id,
            },
        })
    }

    private async isUserInWorkspace(user, workspace) {
        return await this.prisma.user.findFirst({
            where: {
                id: user.id,
                workspaces: {
                    some: {
                        id: workspace.id,
                    },
                },
            },
        })
    }

    private async findAcceptedUserInvites(user) {
        return await this.prisma.invite.findMany({
            where: {
                email: user.email,
                accepted: true,
            },
            include: {
                workspace: true,
            },
        })
    }

    private async findUserDirectoryFromWorkspaceId(workspaceId: number) {
        return this.prisma.userDirectory.findFirst({
            where: {
                tenant: {
                    workspaces: {
                        some: {
                            id: workspaceId,
                        },
                    },
                },
            },
            include: {
                users: true,
                guestUsers: true,
                identityProvider: true,
            },
        })
    }

    private async userHasSameRoleInWorkspace(userId, roleId) {
        return await this.prisma.user.findFirst({
            where: {
                id: userId,
                roles: {
                    some: {
                        roleId: roleId,
                    },
                },
            },
        })
    }
}
