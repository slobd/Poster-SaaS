import { Injectable, NotImplementedException } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import {
    UserRepository,
    UserWithRolesAndAvatarAndPosters,
    WorkspaceUserFindMany,
} from '@/iam/users/user.repository'
import {
    AzureUserService,
    CreateAzureUser,
    UpdateAzureUser,
} from '@/azure/azure-user.service'
import { mapAzureUserToServiceUser } from '@/utils/helpers'
import { ConfigService } from '@nestjs/config'

export type CreateUserOptions = {
    forceChangePasswordNextSignIn: boolean
}

export type CreateUserBody = Pick<
    Prisma.UserCreateInput,
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'subscribed'
    | 'termOfUse'
    | 'privacyPolicy'
> & { password: string }

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly azureUserService: AzureUserService,
        private readonly configService: ConfigService,
    ) {}

    async create(
        user: CreateUserBody,
        options?: CreateUserOptions,
    ): Promise<User> {
        const azureBody = this.getAzureBody(user, options)

        console.time('Execution Time')
        let azureUser = await this.azureUserService.findOneByEmail(user.email)
        console.timeEnd('Execution Time')

        if (!azureUser)
            azureUser = await this.azureUserService.create(azureBody)

        const serviceUser = mapAzureUserToServiceUser(azureUser)

        return await this.userRepository.create(serviceUser)
    }

    private getAzureBody(user: CreateUserBody, options: CreateUserOptions) {
        const issuer = this.configService.get('LOCAL_ACCOUNT_ISSUER')
        const body: CreateAzureUser = {
            displayName: `${user.firstName} ${user.lastName}`,
            givenName: user?.firstName,
            surname: user?.lastName,
            accountEnabled: true,
            passwordProfile: {
                forceChangePasswordNextSignIn:
                    options?.forceChangePasswordNextSignIn || false,
                password: user.password,
            },
            identities: [
                {
                    issuer: `${issuer}.onmicrosoft.com`,
                    signInType: 'emailAddress',
                    issuerAssignedId: user.email,
                },
            ],
        }
        return body
    }

    /**
     * @function createDummyUser creates a dummy user with a random password. User needs to confirmed their email and set the password.
     * @param {User} user the user to create: firstName, lastName and email are enough
     * @returns user object created
     * TODO: Remove a just call created with dummyUser === true
     */
    async createDummyUser(user: any): Promise<User> {
        throw new NotImplementedException(
            'The code to create dummy users was obsolete, please use the create method of the UsersService',
        )
    }

    async findUnique(
        where: Prisma.UserWhereUniqueInput,
    ): Promise<UserWithRolesAndAvatarAndPosters> {
        // TODO: Fetch user from Azure AD B2C
        return await this.userRepository.findUnique(where)
    }

    async findMany(
        where: Prisma.UserWhereInput,
    ): Promise<WorkspaceUserFindMany[]> {
        return await this.userRepository.findMany(where)
    }

    async findManyByTenantId(
        id: number,
    ): Promise<UserWithRolesAndAvatarAndPosters[]> {
        return this.userRepository.findManyByTenantId(id)
    }

    async update(
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput,
    ): Promise<User> {
        const user = await this.userRepository.update(where, data)

        const azureUpdateBody = this.mapNestUserToAzureUser(data)

        if (Object.keys(azureUpdateBody).length > 0)
            await this.azureUserService.update(user.objectId, azureUpdateBody)
        return user
    }

    private mapNestUserToAzureUser(
        data: Prisma.UserUpdateInput,
    ): UpdateAzureUser {
        const azureReq = {}
        const azureColumns = ['givenName', 'surname']
        const nestColumns = ['firstName', 'lastName']
        for (const i in nestColumns) {
            if (data[nestColumns[i]])
                azureReq[azureColumns[i]] = data[nestColumns[i]]
        }
        return azureReq as UpdateAzureUser
    }

    async delete(id: number): Promise<User> {
        const user = await this.userRepository.delete(id)
        await this.azureUserService.delete(user.objectId)
        return user
    }
}
