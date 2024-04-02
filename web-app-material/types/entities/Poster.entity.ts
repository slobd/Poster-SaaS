/* eslint-disable camelcase */
import { PDFLayout } from '../canvas'
import { PosterFindings } from './PosterFindings.entity'
import { Keyword } from './Keyword.entity'
import { Tenant } from './Tenant.entity'
import { Comment } from './Comment.entity'
import { PosterVisibilityEnum } from './PosterVisibility.entity'
import { PosterType } from '~/types/entities/PosterType.entity'
import { Topic } from '~/types/entities/Topic.entity'
// import { Layout } from '~/types/entities/Layout.entity'
import { PosterContent } from '~/types/entities/PosterContent.entity'
import { User } from '~/types/entities/User.entity'
import { UploadResponse } from '~/types/entities/Upload.entity'

// TODO generate interfaces from entities the server with typeorm
export interface Poster {
    id: number

    user: User

    tenant?: Tenant

    comments?: Comment[]

    summary?: string

    description?: string

    findings?: PosterFindings

    type: PosterType

    visibility: PosterVisibilityEnum

    layout?: PDFLayout

    keywords: Keyword[]

    topics: Topic[]

    posterContent?: PosterContent[]

    title: string

    authors: User[]

    pdf: UploadResponse

    image: UploadResponse

    onlineSessionLink?: string

    createdAt: Date

    updatedAt: Date

    publishedAt?: string
}
