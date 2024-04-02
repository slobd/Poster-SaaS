import { UploadsService } from '@/uploads/uploads.service'
import { Injectable, Scope } from '@nestjs/common'
import { PosterDto, PosterRepository } from '../poster.repository'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PosterDeletedEvent } from '@/posters/events/poster-deleted.event'
import { createEvent } from '@/utils/helpers'

@Injectable({ scope: Scope.REQUEST })
export class PostersDeleteHandler {
    private poster: PosterDto

    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly uploadsService: UploadsService,
        private eventEmitter: EventEmitter2,
    ) {}

    async handle(id: number): Promise<void> {
        this.poster = await this.posterRepository.findOneById(id)

        await this.posterRepository.delete(id)

        await this.deletePosterAssets()

        const event = createEvent(PosterDeletedEvent, { poster: this.poster })

        this.eventEmitter.emit(PosterDeletedEvent.NAME, event)

        return null
    }

    private async deletePosterAssets() {
        if (this.poster.image) {
            await this.uploadsService.deleteUpload(this.poster.image)
        }
        if (this.poster.pdf) {
            await this.uploadsService.deleteUpload(this.poster.pdf)
        }
    }
}
