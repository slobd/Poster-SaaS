import { PaginationDto } from '@/utils/dto/pagination.dto'
import { Transform } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator'
import { PosterVisibilityEnum } from '@prisma/client'

export class FindPosterDto extends PaginationDto {
    @IsEnum(PosterVisibilityEnum)
    visibility: PosterVisibilityEnum = PosterVisibilityEnum.PUBLIC

    @IsString()
    @IsOptional()
    title?: string

    @IsArray()
    @IsOptional()
    topics?: string[]

    @IsArray()
    @IsOptional()
    keywords?: string[]

    @IsArray()
    @IsOptional()
    authors?: string[]

    @IsArray()
    @IsOptional()
    organizations?: string[]

    @IsString()
    @IsOptional()
    search: string

    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    or?: boolean = false
}
