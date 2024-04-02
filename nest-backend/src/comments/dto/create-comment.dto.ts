import { Allow, IsString } from 'class-validator'
import { User } from '@prisma/client'

export class CreateCommentData {
    @IsString()
    content: string

    @Allow()
    author: User

    @Allow()
    posterId: number
}
