import { Invite } from '@prisma/client'
import { IsEmail, IsNumber, IsOptional } from 'class-validator'

export class CreateInviteDto implements Partial<Invite> {
    @IsEmail()
    email: string

    @IsNumber()
    roleId: number

    @IsNumber()
    tenantId: number

    @IsNumber()
    workspaceId: number

    @IsOptional()
    projectId: number
}
