import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PosterUpdatedEvent } from '@/posters/events/poster-updated.event'
import { BaseClass } from '@/utils/shared/base-class'
import { PosterDto } from '@/posters/poster.repository'
import {
    FeaturesEnum,
    GalleryRules,
} from '@/access-control/access-control.types'
import { RulesService } from '@/access-control/rules/rules.service'

@Injectable()
export class PosterUpdatedListener extends BaseClass {
    constructor(private readonly rulesService: RulesService) {
        super()
    }

    @OnEvent(PosterUpdatedEvent.NAME)
    async handlePosterUpdatedEvent(event: PosterUpdatedEvent): Promise<void> {
        this.logger.debug(event)
        const { addedAuthors, removedAuthors, poster } = event
        await this.createRulesForCoauthors(poster, addedAuthors)
        await this.removeRulesForCoauthors(poster, removedAuthors)
    }

    private async createRulesForCoauthors(poster: PosterDto, newAuthors) {
        const coauthorsRules = newAuthors.map((author) => ({
            feature: FeaturesEnum.Gallery,
            name: GalleryRules.readPoster,
            options: {
                id: poster.id,
            },
            userId: author.id,
        }))

        await this.rulesService.createMany(coauthorsRules)
    }

    private async removeRulesForCoauthors(poster: PosterDto, removedAuthors) {
        const coauthorsRules = removedAuthors.map((author) => ({
            feature: FeaturesEnum.Gallery,
            name: GalleryRules.readPoster,
            options: {
                id: poster.id,
            },
            userId: author.id,
        }))

        await this.rulesService.deleteMany(coauthorsRules)
    }
}
