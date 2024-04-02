import { InformationTab, Keyword, Topic, Upload } from '@prisma/client'
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

// class Topic {
//     name: string
// }

// class Keyword {
//     name: string
// }

// class Attachment {
//     id: number
// }

export class CreateInformationTabDto
    implements Omit<InformationTab, 'projectId'>
{
    @IsNumber()
    @IsOptional()
    id: number

    @IsString()
    @IsOptional()
    description: string

    @IsArray()
    @IsOptional()
    topics: Topic[]

    @IsArray()
    @IsOptional()
    keywords: Keyword[]

    @IsArray()
    @IsOptional()
    attachments: Upload[]
}
