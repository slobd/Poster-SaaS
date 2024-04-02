import { ApiProperty } from '@nestjs/swagger'
import { plainToClass, Transform, Type } from 'class-transformer'
import {
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { PosterBinariesDto } from './poster-binaries.dto'
import { PosterVisibilityEnum } from '@prisma/client'
import { KeywordDto } from '@/posters/dto/keyword.dto'
import { TopicDto } from '@/posters/dto/topic.dto'

export class CreatePosterDataWorkspace {
    @IsInt()
    id: number

    @IsInt()
    tenantId: number
}

class AuthorDto {
    @IsInt()
    id: number
}

export class CreatePosterData {
    @IsString()
    title: string

    @ValidateNested()
    @Type(() => CreatePosterDataWorkspace)
    workspace: CreatePosterDataWorkspace

    @IsString()
    @IsOptional()
    description?: string

    @ValidateNested()
    @Type(() => KeywordDto)
    @IsArray()
    @IsOptional()
    keywords?: KeywordDto[]

    @ValidateNested()
    @Type(() => TopicDto)
    @IsArray()
    @IsOptional()
    topics?: TopicDto[]

    @IsEnum(PosterVisibilityEnum)
    visibility: PosterVisibilityEnum

    @IsArray()
    @ValidateNested()
    @Type(() => AuthorDto)
    authors: AuthorDto[]
}

export class CreatePosterDto extends PosterBinariesDto {
    /**
     * TODO: Bug - Transform is executed before IsJson and IsNotEmpty
     */
    @ApiProperty({ description: 'Schema: CreatePosterData' })
    @ValidateNested()
    @Transform(({ value }) => plainToClass(CreatePosterData, JSON.parse(value)))
    // @IsJSON()
    @IsNotEmpty()
    data: CreatePosterData
}
