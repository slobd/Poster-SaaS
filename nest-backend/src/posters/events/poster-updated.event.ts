import { IEvent } from '@/utils/types'
import { PosterDto } from '@/posters/poster.repository'
import { UpdateAuthorDto } from '@/posters/dto/update-author.dto'

export class PosterUpdatedEvent implements IEvent<typeof PosterUpdatedEvent> {
    static NAME = 'poster.updated'

    poster: PosterDto

    oldPoster: PosterDto

    addedAuthors: UpdateAuthorDto[]

    removedAuthors: UpdateAuthorDto[]

    constructor(partial: PosterUpdatedEvent) {
        Object.assign(this, partial)
    }
}
