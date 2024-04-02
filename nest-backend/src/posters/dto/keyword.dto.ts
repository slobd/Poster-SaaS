import { Keyword } from '@prisma/client'
import { IsString } from 'class-validator'

export class KeywordDto implements Pick<Keyword, 'name'> {
    @IsString()
    name: string
}
