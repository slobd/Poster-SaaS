import { Prisma } from '@prisma/client'
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class FindOneIdentityProviderDto
    implements Prisma.IdentityProviderWhereUniqueInput
{
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id?: number

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    domain?: string

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    userDirectoryId?: number

    @IsEmail()
    email?: string
}
