import { PrimaryColumn } from 'typeorm'
import { Poster } from '@/posters/entities/poster.entity'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class Topic {
    @PrimaryColumn()
    name: string

    @ApiHideProperty()
    @Exclude()
    posters: Poster[]
}
