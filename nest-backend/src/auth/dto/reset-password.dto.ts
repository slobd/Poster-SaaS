import { IsEmail, IsString, IsUUID } from 'class-validator'

export class ResetPasswordDto {
    @IsEmail()
    email: string

    @IsString()
    password: string

    @IsString()
    passwordConfirm: string

    @IsUUID()
    token: string
}
