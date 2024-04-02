import { IsNumber } from 'class-validator'

export class UpdateUserRoleDto {
    @IsNumber()
    roleId: number
}
