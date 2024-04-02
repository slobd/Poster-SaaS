import { IsUnique } from '@/utils/validation/is-unique.validator'
import {
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Validate,
    ValidateIf,
    ValidateNested,
} from 'class-validator'

import { TenantFeatures } from './tenant-features.entity'
import { TenantTheme } from './tenant-theme.entity'
import { Upload } from '@/uploads/upload.entity'
import { IsTrue } from '@/utils/validation/is-true.validator'
import { Type } from 'class-transformer'
import { Prisma, Role, Tenant as PrismaTenant } from '@prisma/client'

const tenantWithRoles = Prisma.validator<Prisma.TenantArgs>()({
    include: {
        roles: true,
    },
})

export type TenantWithRoles = Prisma.TenantGetPayload<typeof tenantWithRoles>

export class Tenant implements PrismaTenant {
    id: number

    // @Column({ unique: true })
    @Validate(IsUnique, ['tenant'])
    name: string

    // @Column({ unique: true })
    @Validate(IsUnique, ['tenant'])
    @ValidateIf(() => process.env.NODE_ENV !== 'development')
    @IsUrl()
    host: string

    roles?: Role[]

    @IsNumber()
    @IsOptional()
    themeId: number

    @Type(() => Upload)
    logo?: Upload

    logoId: number | null

    ownerId: number

    @IsTrue()
    termOfUse: boolean

    enabled: boolean

    @ValidateNested()
    @IsOptional()
    @Type(() => TenantFeatures)
    features?: TenantFeatures

    @ValidateNested()
    @IsOptional()
    @Type(() => TenantTheme)
    theme?: TenantTheme

    createdAt: Date

    updatedAt: Date

    @IsString()
    @IsOptional()
    domain: string | null
}
