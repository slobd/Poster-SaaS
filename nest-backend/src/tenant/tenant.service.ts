import { Injectable } from '@nestjs/common'
import { Tenant } from './entities/tenant.entity'
import { HelpersService } from '@/utils/services/helpers.service'
import { TenantSuperadmin } from './entities/tenant-theme.entity'
import { CreateUserBody, UsersService } from '@/iam/users/users.service'
import { User, IdentityProvider, UserDirectory } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { UserAccountService } from '@/iam/user-account/user-account.service'
import { AzureUserService } from '@/azure/azure-user.service'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'
import { TenantRoleEnum } from '@/access-control/roles/default-roles.service'
import { RoleDomain } from '@/access-control/rules/rules.constants'
import { UserDirectoryService } from '@/iam/user-directory/user-directory.service'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'

@Injectable()
export class TenantService {
    constructor(
        // Global dependencies
        private readonly prisma: PrismaService,
        private readonly helpersService: HelpersService,
        // Local dependencies
        private readonly userService: UsersService,
        private readonly userAccountService: UserAccountService,
        private readonly userAccountRepository: UserAccountRepository,
        private readonly azureUserService: AzureUserService,
        private readonly userDirectoryService: UserDirectoryService,
        private readonly usersRolesService: UsersRolesService,
    ) {}

    async findTenantUrl(tenant: Tenant): Promise<string> {
        const protocol = this.helpersService.getProtocolBaseOnEnv()
        return `${protocol}://${tenant.host}`
    }

    async createOwner(user: TenantSuperadmin): Promise<User> {
        const userData: CreateUserBody = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            subscribed: false,
            termOfUse: true,
            privacyPolicy: true,
            password: 'Gutenberg-Stronger-Together-2022',
        }

        try {
            return this.userService.create(userData, {
                forceChangePasswordNextSignIn: false,
            })
        } catch (error) {
            console.error(error)
        }
    }

    async findOrCreateOwner(
        adminData: TenantSuperadmin,
        identityProvider: IdentityProvider,
    ): Promise<User> {
        let newUser = false
        let owner: User = await this.prisma.user.findUnique({
            where: {
                email: adminData.email,
            },
        })

        if (!owner) {
            // Create User entity and user inside Azure
            owner = await this.createOwner(adminData)
            newUser = true
        }

        const azureUser = await this.azureUserService.findOneByEmail(
            owner.email,
        )

        const userAccount = await this.userAccountRepository.findOne({
            objectId: azureUser.id,
        })

        if (!userAccount) {
            await this.userAccountService.createUserAccount({
                user: owner,
                identityProvider,
                objectId: azureUser.id,
                isUserNew: newUser,
            })
        }

        return owner
    }

    /**
     * Returns false if the user was already in the Tenant
     *
     * @param userDirectory
     * @param identityProvider
     * @param user
     *
     * @returns false
     */
    async addUserToTenant(
        userDirectory: UserDirectory & {
            users: User[]
            guestUsers: User[]
            identityProvider: IdentityProvider[]
        },
        identityProvider: IdentityProvider,
        user: User,
        // domain: string,
        // invited: boolean,
    ): Promise<boolean> {
        // If IdP is from user directory
        const isUserInUserDirectory =
            await this.userDirectoryService.isUserInUserDirectory(
                userDirectory.id,
                user,
            )

        // If the user gets invited to multiple workspaces of the same user directory this is not needed
        if (isUserInUserDirectory) return false

        // If email domain matches tenant domain

        const idpIsFromUserDirectory = userDirectory.identityProvider.find(
            (idp) => idp.id === identityProvider.id,
        )

        const userEmailDomain = user.email.split('@')[1]
        const userEmailMatchTenantDomain = userDirectory.domain
            ? userDirectory.domain.includes(userEmailDomain)
            : false

        // TODO: Domain match won't work. Because this only executes with non-local cases
        if (userEmailMatchTenantDomain || idpIsFromUserDirectory) {
            await this.userDirectoryService.addUserToUsersList(
                userDirectory,
                user,
            )

            const memberRole = await this.prisma.role.findUnique({
                where: {
                    name_tenantId_domain: {
                        name: TenantRoleEnum.MEMBER,
                        domain: RoleDomain.Tenant(userDirectory.tenantId),
                        tenantId: userDirectory.tenantId,
                    },
                },
            })

            await this.usersRolesService.giveRoleToUser(user.id, memberRole.id)

            // Add to workspace
        } else {
            await this.userDirectoryService.addUserToGuestUsersList(
                userDirectory,
                user,
            )
        }
        return true
    }
}
