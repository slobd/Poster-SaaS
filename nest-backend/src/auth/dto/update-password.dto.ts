import { IsSameAs } from '@/utils/validation/is-same-as.validator'
import { IsEmail, IsNumber, IsString } from 'class-validator'

export class UpdatePasswordDto {
    @IsNumber()
    id: number

    @IsEmail()
    email: string

    @IsString()
    currentPassword: string

    @IsString()
    newPassword: string

    @IsString()
    @IsSameAs('newPassword', {
        message: 'Passwords do not match',
    })
    newPasswordConfirm: string
}
