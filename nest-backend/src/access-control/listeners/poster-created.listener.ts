import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PosterCreatedEvent } from '@/posters/events/poster-created.event'
import { RulesService } from '@/access-control/rules/rules.service'
import {
    CommentRules,
    FeaturesEnum,
    GalleryRules,
} from '@/access-control/access-control.types'
import { PosterDto } from '@/posters/poster.repository'

@Injectable()
export class PosterCreatedListener {
    constructor(private readonly rulesService: RulesService) {}

    @OnEvent(PosterCreatedEvent.NAME)
    async handlePosterCreatedEvent(event: PosterCreatedEvent): Promise<void> {
        const { poster } = event

        await this.createRulesForOwner(poster)

        await this.createRulesForCoauthors(poster)
    }

    private async createRulesForOwner(poster: PosterDto) {
        await this.rulesService.createMany([
            {
                feature: FeaturesEnum.Gallery,
                name: GalleryRules.readPoster,
                options: {
                    id: poster.id,
                },
                userId: poster.user.id,
            },
            {
                feature: FeaturesEnum.Gallery,
                name: GalleryRules.updatePoster,
                options: {
                    id: poster.id,
                },
                userId: poster.user.id,
            },
            {
                feature: FeaturesEnum.Gallery,
                name: GalleryRules.deletePoster,
                options: {
                    id: poster.id,
                },
                userId: poster.user.id,
            },
            {
                feature: FeaturesEnum.Comment,
                name: CommentRules.deleteCommentOfPoster,
                options: {
                    posterId: poster.id,
                },
                userId: poster.user.id,
            },
        ])
    }

    private async createRulesForCoauthors(poster: PosterDto) {
        const coauthorsRules = poster.authors
            .filter((author) => author.id !== poster.user.id)
            .map((author) => ({
                feature: FeaturesEnum.Gallery,
                name: GalleryRules.readPoster,
                options: {
                    id: poster.id,
                },
                userId: author.id,
            }))

        await this.rulesService.createMany(coauthorsRules)
    }
}
