import { UserDirectoryRepository } from '@/iam/user-directory/user-directory.repository'
import { AzureUser } from '@/azure/azure-user.service'
import { User, UserDirectory, IdentityProvider } from '@prisma/client'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'
import { PrismaService } from '@/prisma/prisma.service'
import { UserRepository } from '@/iam/users/user.repository'
import { UserAccountService } from '@/iam/user-account/user-account.service'
import { Injectable } from '@nestjs/common'
import { MappedAzureUser } from '@/utils/helpers'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { TenantRoleEnum } from '@/access-control/roles/default-roles.service'
import { RoleDomain } from '@/access-control/rules/rules.constants'

@Injectable()
export class UserDirectoryService {
    constructor(
        private readonly userDirectoryRepository: UserDirectoryRepository,
        private readonly userAccountRepository: UserAccountRepository,
        private readonly userRepository: UserRepository,
        private readonly prisma: PrismaService,
        private readonly userAccountService: UserAccountService,
        private readonly usersRolesService: UsersRolesService,
    ) {}

    async findOrCreateUserAndUserAccount(
        azureUser: AzureUser,
        mappedAzureUser: MappedAzureUser,
        identityProvider: IdentityProvider,
    ): Promise<User> {
        const userAccount = await this.userAccountRepository.findOne({
            objectId: mappedAzureUser.objectId,
        })

        // If no user account entity
        if (!userAccount) {
            const { newUser, user } = await this.findOrCreateUser(
                mappedAzureUser,
            )

            // OR if it is NOT a social provider in case we ever use them
            // if (identityProvider.name !== 'local') {
            //     // Inside addUserToUserDirectory IdP is always going to be from User Directory
            //     // But not for the invites since the idp there is the idp of the invite
            //     const userDirectory =
            //         await this.userDirectoryRepository.findFirst({
            //             domain: {
            //                 contains: identityProvider.domain,
            //             },
            //         })
            //
            //     // Some IdPs have no user directory (e.g. local)
            //     if (userDirectory) {
            //         await this.addUserToUserDirectory(
            //             userDirectory,
            //             identityProvider,
            //             user,
            //         )
            //     }
            // }

            await this.userAccountService.createUserAccount({
                user,
                identityProvider,
                objectId: azureUser.id,
                isUserNew: newUser,
            })

            return user
        } else {
            return this.prisma.user.findUnique({
                where: {
                    email: mappedAzureUser.email,
                },
            })
        }
    }

    private async findOrCreateUser(mappedAzureUser: MappedAzureUser) {
        let newUser = false
        let user: User

        user = await this.prisma.user.findUnique({
            where: {
                email: mappedAzureUser.email,
            },
        })

        // If no user entity
        if (!user) {
            user = await this.userRepository.create(mappedAzureUser)
            newUser = true
        }
        return { newUser, user }
    }

    // async assignUserToUserDirectory(
    //     serviceUser: User,
    //     identityProvider: IdentityProvider,
    // ): Promise<void> {
    //     // const tenantIdp =
    //     //     await this.identityProviderService.findOrCreateIdentityProvider(
    //     //         userSignedInIdp,
    //     //         serviceUser.email,
    //     //     )
    //     //
    //     // if (!tenantIdp) return
    //
    //     // TODO: use find first and add return type to all the userDirectory functions
    //     const userDirectory = await this.userDirectoryRepository.findFirst({
    //         domain: {
    //             contains: identityProvider.domain,
    //         },
    //     })
    //
    //     /**
    //      * There can be Identity Providers without User Directories (for example, local or social providers like gmail, and LinkedIn)
    //      */
    //     if (userDirectory.length > 0) {
    //         // It should always be one.
    //         const currentUserDirectory = userDirectory[0]
    //
    //         await this.addUser2UserDirectory(
    //             currentUserDirectory,
    //             serviceUser,
    //             identityProvider.domain,
    //             false,
    //         )
    //     }
    // }

    /**
     *
     * @param userDirectory The user directory from the workspace where the user accepted the invite
     * @param identityProvider The identity provider the user used to log in
     * @param user
     */
    async addUserToUserDirectory(
        userDirectory: UserDirectory & {
            users: User[]
            guestUsers: User[]
            identityProvider: IdentityProvider[]
        },
        identityProvider: IdentityProvider,
        user: User,
        // domain: string,
        // invited: boolean,
    ): Promise<void> {
        // If email domain matches tenant domain
        // If IdP is from user directory
        const isUserInUserDirectory = await this.isUserInUserDirectory(
            userDirectory.id,
            user,
        )

        // If the user gets invited to multiple workspaces of the same user directory this is not needed
        if (isUserInUserDirectory) return

        const userEmailDomain = user.email.split('@')[1]
        const idpIsFromUserDirectory = userDirectory.identityProvider.find(
            (idp) => idp.id === identityProvider.id,
        )

        // TODO: Domain match won't work. Because this only executes with non-local cases
        if (
            userDirectory.domain.includes(userEmailDomain) ||
            idpIsFromUserDirectory
        ) {
            await this.addUserToUsersList(userDirectory, user)

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
            await this.addUserToGuestUsersList(userDirectory, user)
        }

        // if (
        //     invited &&
        //     identityProvider &&
        //     !userDirectory.domain.includes(identityProvider.domain)
        // ) {
        //     await this.addUserToGuestUsersList(
        //         userDirectory,
        //         user,
        //     )
        // } else {
        //     await this.addUserToUsersList(userDirectory, user)
        // }
    }

    async isUserInUserDirectory(
        userDirectoryId: number,
        user: User,
    ): Promise<boolean> {
        return !!(await this.prisma.userDirectory.findFirst({
            where: {
                id: userDirectoryId,
                OR: [
                    {
                        users: {
                            some: {
                                id: user.id,
                            },
                        },
                    },
                    {
                        guestUsers: {
                            some: {
                                id: user.id,
                            },
                        },
                    },
                ],
            },
        }))
    }

    async addUserToGuestUsersList(
        currentUserDirectory: UserDirectory & {
            users: User[]
            guestUsers: User[]
        },
        user: User,
    ): Promise<void> {
        const guestUserList = currentUserDirectory.guestUsers.map((u) => {
            return { id: u.id }
        })
        guestUserList.push({ id: user.id })
        try {
            await this.userDirectoryRepository.update(
                {
                    id: currentUserDirectory.id,
                },
                {
                    guestUsers: {
                        set: [],
                        connect: guestUserList,
                    },
                },
            )
        } catch (e) {
            console.log('Assigning user to Guest User directory failed: ', e)
        }
    }

    async addUserToUsersList(
        currentUserDirectory: UserDirectory & {
            users: User[]
            guestUsers: User[]
        },
        user: User,
    ): Promise<void> {
        // TODO: Do it from the User side instead. Less danger if something goes wrong and the operation is smaller
        const userList = currentUserDirectory.users.map((u) => {
            return { id: u.id }
        })
        userList.push({ id: user.id })

        try {
            await this.userDirectoryRepository.update(
                {
                    id: currentUserDirectory.id,
                },
                {
                    users: {
                        set: [],
                        connect: userList,
                    },
                },
            )
        } catch (e) {
            console.log('Assigning user to User directory failed: ', e)
        }
    }

    async isUserGuest(workspaceId: number, userId: number): Promise<boolean> {
        return !!(await this.prisma.userDirectory.findFirst({
            where: {
                tenant: {
                    workspaces: {
                        some: {
                            id: {
                                equals: workspaceId,
                            },
                        },
                    },
                },
                guestUsers: {
                    some: {
                        id: {
                            equals: userId,
                        },
                    },
                },
            },
        }))
    }
}
