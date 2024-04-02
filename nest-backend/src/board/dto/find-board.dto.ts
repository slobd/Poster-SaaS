import { IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class FindBoardDto {
    @IsInt()
    @Type(() => Number)
    projectId: number
}
