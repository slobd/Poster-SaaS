import { User } from '~/types/entities/User.entity'
import { IdentityProvider } from '~/types/entities/IdentityProvider.entity'

export interface UserAccount {
    id: number

    objectId: string

    user: User

    default: boolean

    identityProvider: IdentityProvider
}
