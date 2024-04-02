import { IsNumber } from 'class-validator'

export class UpdateRolesOfUserDto {
    @IsNumber()
    userId: number

    @IsNumber()
    roleId: number
}
