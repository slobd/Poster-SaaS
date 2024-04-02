import { ProjectVisibilityEnum } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class FindProjectDto {
    @IsString()
    @IsOptional()
    name?: string

    @IsEnum('ProjectVisibilityEnum')
    @IsOptional()
    visibility?: ProjectVisibilityEnum
}
