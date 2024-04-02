import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PosterDeletedEvent } from '@/posters/events/poster-deleted.event'
import { PrismaService } from '@/prisma/prisma.service'
import {
    FeaturesEnum,
    SubjectEnum,
} from '@/access-control/access-control.types'
import { BaseClass } from '@/utils/shared/base-class'

@Injectable()
export class PosterDeletedListener extends BaseClass {
    constructor(private prisma: PrismaService) {
        super()
    }

    @OnEvent(PosterDeletedEvent.NAME)
    async handlePosterDeletedEvent(event: PosterDeletedEvent): Promise<void> {
        this.logger.debug(event)

        const { poster } = event
        const deletedRules = await this.prisma.rule.deleteMany({
            where: {
                feature: FeaturesEnum.Gallery,
                subject: SubjectEnum.Poster,
                options: {
                    equals: { id: poster.id },
                },
            },
        })

        this.logger.debug(deletedRules)
    }
}
