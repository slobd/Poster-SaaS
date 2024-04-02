import { PaginationDto } from '@/utils/dto/pagination.dto'
import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class FindCommentDto extends PaginationDto {
    @IsNumber()
    @Type(() => Number)
    poster?: number
}
