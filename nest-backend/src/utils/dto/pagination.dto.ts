import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class PaginationDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    take?: number

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    skip?: number
}
