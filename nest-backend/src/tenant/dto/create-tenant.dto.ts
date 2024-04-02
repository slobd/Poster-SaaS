import { PickType } from '@nestjs/swagger'
import { ValidateNested } from 'class-validator'
import { TenantSuperadmin } from '../entities/tenant-theme.entity'
import { Tenant } from '../entities/tenant.entity'
import { Type } from 'class-transformer'

export class CreateTenantDto extends PickType(Tenant, [
    'name',
    'host',
    'features',
    'themeId',
    'enabled',
    'logo',
    'domain',
]) {
    @ValidateNested()
    @Type(() => TenantSuperadmin)
    superadmin: TenantSuperadmin
}
