import { IsUnique } from '@/utils/validation/is-unique.validator'
import { Validate } from 'class-validator'

export class UpdateTenantFromWebAppDto {
    @Validate(IsUnique, ['tenant'])
    name: string
}
