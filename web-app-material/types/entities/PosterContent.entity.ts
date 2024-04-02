import { Poster } from './Poster.entity'
import { UploadResponse } from '~/types/entities/Upload.entity'
export interface PosterContent {
    id: number

    name: string

    simpleText: string

    structuredText: any // TODO: Find prosemirror type

    images: UploadResponse[]

    poster?: Poster
}
