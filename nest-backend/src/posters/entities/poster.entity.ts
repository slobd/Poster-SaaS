import { CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Type } from 'class-transformer'
import { Keyword } from '@/posters/entities/keyword.entity'
import { Topic } from '@/posters/entities/topic.entity'
import { IsOptional, IsString } from 'class-validator'
import {
    User as PrismaUser,
    Poster as PrismaPoster,
    PosterVisibilityEnum,
} from '@prisma/client'
import { User } from '@/iam/users/entities/user.entity'
import { Upload, Comment } from '@prisma/client'

export class Poster implements PrismaPoster {
    id: number

    /**
     * The User come from the Request, so we don't need to whitelist it
     * Owner of the document
     */
    user?: User

    userId: number

    workspaceId: number

    comments?: Comment[]

    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description: string

    pdf: Upload

    pdfId: number

    image: Upload

    imageId: number

    visibility: PosterVisibilityEnum

    @Type(() => Keyword)
    keywords: Keyword[]

    @Type(() => Topic)
    topics: Topic[]

    @Type(() => User)
    authors: PrismaUser[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
