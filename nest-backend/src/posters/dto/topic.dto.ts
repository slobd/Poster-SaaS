import { Topic } from '@prisma/client'
import { IsString } from 'class-validator'

export class TopicDto implements Pick<Topic, 'name'> {
    @IsString()
    name: string
}
