import { PartialType } from '@nestjs/swagger'
import { ProjectVisibilityEnum } from '@prisma/client'
import { CreateInformationTabDto } from '@/project/dto/create-information-tab.dto'
import {
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

class UpdateInformationTabDto extends PartialType(CreateInformationTabDto) {}

export class UpdateProjectDto {
    @IsNumber()
    @IsOptional()
    id: number

    @IsString()
    @IsOptional()
    name: string

    @IsEnum('ProjectVisibilityEnum')
    @IsOptional()
    visibility: ProjectVisibilityEnum

    @ValidateNested()
    @IsOptional()
    @Type(() => UpdateInformationTabDto)
    informationTab: UpdateInformationTabDto

    @IsInt()
    @Type(() => Number)
    tenantId: number
}
