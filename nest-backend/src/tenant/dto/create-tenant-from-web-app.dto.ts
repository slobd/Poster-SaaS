import { Upload } from '@/uploads/upload.entity'
import { IsUnique } from '@/utils/validation/is-unique.validator'
import { IsOptional, IsString, Validate } from 'class-validator'

export class CreateTenantAppDto {
    @IsString()
    @Validate(IsUnique, ['tenant'])
    name: string

    @IsString()
    @Validate(IsUnique, ['tenant'])
    host: string

    @IsOptional()
    logo?: Upload

    @IsString()
    @IsOptional()
    @Validate(IsUnique, ['tenant'])
    domain: string | null
}
