import { PartialType, PickType } from '@nestjs/swagger'
import { IsOptional, ValidateNested } from 'class-validator'
import { TenantSuperadmin } from '../entities/tenant-theme.entity'
import { Tenant } from '../entities/tenant.entity'
import { Type } from 'class-transformer'

export class UpdateTenantDto extends PickType(PartialType(Tenant), [
    'name',
    'host',
    'features',
    'enabled',
    'domain',
]) {
    @ValidateNested()
    @Type(() => TenantSuperadmin)
    @IsOptional()
    superadmin?: TenantSuperadmin
}
