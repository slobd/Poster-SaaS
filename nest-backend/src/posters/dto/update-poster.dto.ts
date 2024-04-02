import { ApiProperty, PartialType } from '@nestjs/swagger'
import { plainToClass, Transform, Type } from 'class-transformer'
import { IsInt, IsOptional, ValidateNested } from 'class-validator'
import { PosterBinariesDto } from './poster-binaries.dto'

import { CreatePosterData } from '@/posters/dto/create-poster.dto'
import { Upload } from '@prisma/client'

class PosterUpdateUploadDto implements Pick<Upload, 'id'> {
    @IsInt()
    id: number
}

export class UpdatePosterData extends PartialType(CreatePosterData) {
    @ValidateNested()
    @Type(() => PosterUpdateUploadDto)
    @IsOptional()
    pdf?: PosterUpdateUploadDto

    @ValidateNested()
    @Type(() => PosterUpdateUploadDto)
    @IsOptional()
    image?: PosterUpdateUploadDto
}

export class UpdatePosterDto extends PosterBinariesDto {
    @ApiProperty({ description: 'Schema: UpdatePosterData' })
    @ValidateNested()
    @Transform(({ value }) => plainToClass(UpdatePosterData, JSON.parse(value)))
    data: UpdatePosterData
}
