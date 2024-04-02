import { PosterDto } from '@/posters/poster.repository'
import { IEvent } from '@/utils/types'

export class PosterDeletedEvent implements IEvent<typeof PosterDeletedEvent> {
    static NAME = 'poster.deleted'

    poster: PosterDto

    constructor(args: PosterDeletedEvent) {
        // super()
        Object.assign(this, args)
    }
}
