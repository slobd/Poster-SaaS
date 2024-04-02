import { Invite } from '@prisma/client'
import { IsEmail, IsString } from 'class-validator'

export class AcceptInviteDto implements Partial<Invite> {
    @IsString()
    token: string

    @IsEmail()
    email: string
}
