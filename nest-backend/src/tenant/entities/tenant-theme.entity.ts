import { IsEmail, IsHexColor, IsString } from 'class-validator'
import { TenantFeatures } from '@prisma/client'

export class TenantThemeCSS {
    @IsHexColor()
    primaryColor: string

    @IsHexColor()
    secondaryColor: string
}

export class TenantThemeImages {
    primaryLogo: any
}

export class AutoCompleteTopic {
    text: string
}

export class TenantSuperadmin {
    @IsString()
    firstName: string
    @IsString()
    lastName: string
    @IsEmail()
    email: string
}

export class TenantTheme {
    id?: number
    tenantId?: string
    name: string
    host: string
    domain: string
    enabled: boolean
    superadmin: TenantSuperadmin
    features: Omit<TenantFeatures, 'id' | 'tenantId'>
    images: Partial<TenantThemeImages>
    css: Partial<TenantThemeCSS>
}
