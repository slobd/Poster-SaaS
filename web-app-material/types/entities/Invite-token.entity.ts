import { Tenant } from './Tenant.entity'
import { Role } from './Role.entity'

export interface InviteToken {
    token?: string

    email?: string

    tenant?: Tenant

    role?: Role

    expireOn?: Date

    active: boolean

    createdAt: Date
}
