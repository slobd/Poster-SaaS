export interface TenantFeatures {
    id?: number

    AccessControl: boolean

    TenantManagement: boolean
}

export type FeaturesArray = (keyof Omit<TenantFeatures, 'id' | 'tenant'>)[]
