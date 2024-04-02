import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { MulterS3FileRecord } from '@/uploads/types/MulterS3File'
import { UploadsService } from '@/uploads/uploads.service'
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    Scope,
} from '@nestjs/common'
import { CreatePosterDto } from '../dto/create-poster.dto'
import { PosterDto, PosterRepository } from '../poster.repository'
import { PostersService } from '../posters.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PosterCreatedEvent } from '@/posters/events/poster-created.event'

@Injectable({ scope: Scope.REQUEST })
export class PostersPostHandler {
    private readonly logger = new Logger(PostersPostHandler.name)
    private createdPoster: PosterDto

    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly postersService: PostersService,
        private readonly uploadsService: UploadsService,
        private eventEmitter: EventEmitter2,
    ) {}

    async handle(
        body: CreatePosterDto,
        files: MulterS3FileRecord,
        user: SanitizedUserDto,
    ): Promise<PosterDto> {
        await this.postersService.validateCoauthorsAreFromSameWorkspace(
            body.data.authors,
            body.data.workspace.id,
        )

        const { image, pdf } = await this.postersService.storePosterAssets(
            files,
            body,
        )

        const poster = {
            ...body.data,
            image,
            pdf,
            user,
        }

        try {
            this.createdPoster = await this.posterRepository.create(poster)

            this.eventEmitter.emit(
                PosterCreatedEvent.NAME,
                new PosterCreatedEvent({
                    poster: this.createdPoster,
                }),
            )

            return this.createdPoster
        } catch (e) {
            this.logger.error('Error while creating poster', e.stack, e)
            if (image) await this.uploadsService.deleteUpload(image)
            if (pdf) await this.uploadsService.deleteUpload(pdf)

            throw new InternalServerErrorException()
        }
    }
}
