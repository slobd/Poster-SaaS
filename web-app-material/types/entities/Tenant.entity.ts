import { TenantTheme } from './TenantTheme'
import { Role } from './Role.entity'
import { TenantFeatures } from './tenant-features.entity'
import { Poster } from './Poster.entity'

export interface Tenant {
    id: number

    name: string

    shortName?: string

    host?: string

    theme: TenantTheme

    roles: Role[]

    themeId?: number

    published: boolean

    superadminEmail?: string

    features: TenantFeatures

    posters?: Poster[]
}
