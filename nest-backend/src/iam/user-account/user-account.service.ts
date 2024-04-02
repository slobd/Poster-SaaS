import { Injectable } from '@nestjs/common'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'
import { User, IdentityProvider, UserAccount } from '@prisma/client'

interface CreateUserAccountArg {
    user: User
    identityProvider: IdentityProvider
    objectId: string
    isUserNew: boolean
}

@Injectable()
export class UserAccountService {
    constructor(
        private readonly userAccountRepository: UserAccountRepository,
    ) {}

    async createUserAccount(arg: CreateUserAccountArg): Promise<UserAccount> {
        const { user, isUserNew, identityProvider, objectId } = arg

        /**
         * Enabled was introduced just to prevent people from being redirected to their SSO
         * when the setup was still in progress
         */
        return this.userAccountRepository.create({
            user: {
                connect: {
                    id: user.id,
                },
            },
            identityProvider: {
                connect: {
                    id: identityProvider.id,
                },
            },
            objectId: objectId,
            default: isUserNew,
        })
    }
}
