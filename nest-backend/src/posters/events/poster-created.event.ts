import { IEvent } from '@/utils/types'
import { PosterDto } from '@/posters/poster.repository'

export class PosterCreatedEvent implements IEvent<typeof PosterCreatedEvent> {
    static NAME = 'poster.created'

    poster: PosterDto

    constructor(partial: PosterCreatedEvent) {
        Object.assign(this, partial)
    }
}
