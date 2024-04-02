import { Poster } from '@/posters/entities/poster.entity'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class Keyword {
    name: string

    @ApiHideProperty()
    @Exclude()
    posters: Poster[]
}
