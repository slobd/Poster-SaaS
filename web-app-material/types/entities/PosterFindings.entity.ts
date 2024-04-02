import { Poster } from './Poster.entity'
import { UploadResponse } from '~/types/entities/Upload.entity'

export interface PosterFindings {
    id: number

    poster: Poster

    simpleText?: string

    structuredText?: string

    image?: UploadResponse
}
