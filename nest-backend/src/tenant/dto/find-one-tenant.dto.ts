import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
import { Prisma } from '@prisma/client'

export class FindOneTenantDto implements Prisma.TenantWhereUniqueInput {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    host?: string

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    themeId?: number
}
