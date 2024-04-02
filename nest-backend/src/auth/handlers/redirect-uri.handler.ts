import { Injectable } from '@nestjs/common'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import JwtPayload from '@/auth/interfaces/jwt-payload'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User, Workspace, WorkspaceVisibilityEnum } from '@prisma/client'
import { AzureActiveDirectoryB2CService } from '@/azure/azure-active-directory-b2c.service'
import { mapAzureUserToServiceUser, sanitizeUser } from '@/utils/helpers'
import { HelpersService } from '@/utils/services/helpers.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserDirectoryService } from '@/iam/user-directory/user-directory.service'
import { InviteService } from '@/iam/invite/invite.service'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'
import { AzureRedirect } from '@/azure/types'
import { IdentityProviderService } from '@/identity-provider/identity-provider.service'
import { UserDirectoryRepository } from '@/iam/user-directory/user-directory.repository'
import { TenantService } from '@/tenant/tenant.service'

@Injectable()
export class RedirectUriHandler {
    constructor(
        private readonly configService: ConfigService,
        private readonly azureActiveDirectoryB2CService: AzureActiveDirectoryB2CService,
        private readonly jwtService: JwtService,
        private readonly helpersService: HelpersService,
        private readonly prisma: PrismaService,
        private readonly userDirectoryService: UserDirectoryService,
        private readonly inviteService: InviteService,
        private readonly workspacesUsersService: WorkspacesUsersService,
        private readonly identityProviderService: IdentityProviderService,
        private readonly userDirectoryRepository: UserDirectoryRepository,
        private readonly tenantService: TenantService,
    ) {}

    async handle(code: string, type: AzureRedirect): Promise<string> {
        // TODO: If Azure registered using _______ AND the user IdP is a AD work account. Then Create Identity Provider
        const userToken =
            await this.azureActiveDirectoryB2CService.getAccessTokenFromAuthCode(
                code,
                type,
            )

        const azureUser =
            await this.azureActiveDirectoryB2CService.findUserByToken(userToken)

        const idpName =
            this.azureActiveDirectoryB2CService.getIdpNameFromToken(userToken)

        const mappedAzureUser = mapAzureUserToServiceUser(azureUser)

        // TODO: IdP information almost never changes so this could be cached
        const identityProvider =
            await this.identityProviderService.findOrCreateIdentityProvider(
                idpName,
                mappedAzureUser.email,
            )

        // TODO: Find where we use user.objectId
        // TODO: Save objectId in UserAccount instead of in the User entity
        // User will get added to the user directories if the domain matches
        const user =
            await this.userDirectoryService.findOrCreateUserAndUserAccount(
                azureUser,
                mappedAzureUser,
                identityProvider,
            )

        let userDirectory

        if (identityProvider.name !== 'local') {
            // IdP match
            userDirectory = await this.userDirectoryRepository.findFirst({
                domain: {
                    contains: identityProvider.domain,
                },
            })
        } else {
            // Domain match
            const userEmailDomain = user.email.split('@')[1]

            userDirectory = await this.userDirectoryRepository.findFirst({
                domain: {
                    contains: userEmailDomain,
                },
            })
        }
        // const idpIsFromUserDirectory = true

        if (userDirectory) {
            const userWasAssigned = await this.tenantService.addUserToTenant(
                userDirectory,
                identityProvider,
                user,
            )

            if (userWasAssigned) {
                const workspaces = await this.prisma.workspace.findMany({
                    where: {
                        visibility: WorkspaceVisibilityEnum.PUBLIC,
                        tenant: {
                            userDirectory: {
                                id: userDirectory.id,
                            },
                        },
                    },
                })
                if (workspaces.length > 0) {
                    await this.assignToWorkspacesAndGiveMemberRole(
                        user,
                        workspaces,
                    )
                }
            }
        }
        /**
         * This will look for the PUBLIC workspaces of the user directories of the user.
         * If the user is not part of those workspaces they will get assigned to it.
         * User get added to a new User Directory when they log in with a new IdP and a new User Account is created
         */

        await this.inviteService.handleUserInvites(user, identityProvider)

        return this.createRedirectURL(user, azureUser.id)
    }

    private async assignToWorkspacesAndGiveMemberRole(
        user: User,
        workspaces: Workspace[],
    ) {
        // For loop added if a user id in multiple user directory but not assigned to respective workspaces
        // Most cases workspaces will have only 1 workspace
        for (const workspace of workspaces) {
            await this.workspacesUsersService.addUserToWorkspace(
                user.id,
                workspace,
            )
        }
    }

    async createAccessToken(user: SanitizedUserDto, objectId): Promise<string> {
        const payload: JwtPayload = this.createJwtPayload(user, objectId)

        return this.jwtService.sign(payload)
    }

    private createJwtPayload(
        user: SanitizedUserDto,
        objectId: string,
    ): JwtPayload {
        return { email: user.email, sub: user.id, issuer: objectId }
    }

    private async createRedirectURL(
        user: User,
        objectId: string,
    ): Promise<string> {
        const accessToken = await this.createAccessToken(
            sanitizeUser(user),
            objectId,
        )

        const userWithWorkspaces = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                workspaces: {
                    include: {
                        tenant: true,
                    },
                    where: {
                        deleted: false,
                    },
                },
            },
        })

        const workspaces = userWithWorkspaces.workspaces

        let uri: string
        let host: string
        if (workspaces?.length > 0) {
            const protocol = this.helpersService.getProtocolBaseOnEnv()
            const tenantHost = workspaces[0].tenant.host
            const workspaceId = workspaces[0].id
            host = `${protocol}://${tenantHost}`

            uri = `/workspace/${workspaceId}/home`
        } else {
            host = this.configService.get<string>('CLIENT_URL')
            uri = `/user`
        }

        return `${host}/redirect-uri?uri=${encodeURIComponent(
            uri,
        )}&access_token=${accessToken}`
    }
}
