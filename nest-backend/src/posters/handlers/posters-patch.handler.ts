import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { MulterS3FileRecord } from '@/uploads/types/MulterS3File'
import { Injectable, Scope } from '@nestjs/common'
import { UpdateAuthorDto } from '../dto/update-author.dto'
import { UpdatePosterData, UpdatePosterDto } from '../dto/update-poster.dto'
import { PosterDto, PosterRepository } from '../poster.repository'
import { PostersService } from '../posters.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PosterUpdatedEvent } from '@/posters/events/poster-updated.event'
import { createEvent } from '@/utils/helpers'
import { differenceBy } from 'lodash'
import { Upload } from '@prisma/client'

/**
 * Bugs:
 * - It is not updating the assets because Array.map RETURNS a new array (does not modify in place)
 * - Only admin should be able to change authors
 */
@Injectable({ scope: Scope.REQUEST })
export class PostersPatchHandler {
    files: MulterS3FileRecord
    user: SanitizedUserDto
    posterBeforeUpdate: PosterDto
    posterToUpdate: UpdatePosterData

    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly postersService: PostersService,
        private eventEmitter: EventEmitter2,
    ) {}

    async handle(
        id: number,
        body: UpdatePosterDto,
        files: MulterS3FileRecord,
        user: SanitizedUserDto,
    ): Promise<any> {
        await this.postersService.validateCoauthorsAreFromSameWorkspace(
            body.data.authors,
            body.data.workspace.id,
        )
        /**
         * Only admin can change visibility and authors
         */
        this.user = user
        // this.tenant = tenant
        this.files = files

        this.posterBeforeUpdate = await this.posterRepository.findOneById(id)

        // Remove properties that the user should not be able to update
        this.posterToUpdate = body.data

        const { pdf, image } = await this.handleFilesUpload()

        const updatedPoster = await this.posterRepository.update({
            id: this.posterBeforeUpdate.id,
            ...body.data,
            pdf,
            image,
        })

        const event = createEvent(PosterUpdatedEvent, {
            poster: updatedPoster,
            oldPoster: this.posterBeforeUpdate,
            addedAuthors: this.getNewAuthors(),
            removedAuthors: this.getRemovedAuthors(),
        })

        this.eventEmitter.emit(PosterUpdatedEvent.NAME, event)

        return updatedPoster
    }

    private async handleFilesUpload(): Promise<{
        image?: Upload
        pdf?: Upload
    }> {
        return this.postersService.storePosterAssets(
            this.files,
            this.posterBeforeUpdate,
        )
        // if (image) this.posterToUpdate.image = image
        // if (pdf) this.posterToUpdate.pdf = pdf
    }

    // private async transformAllAuthorsToUsers() {
    //     // Tenant is not an updatable property, and it was removed from the posterToUpdate
    //     // We need the tenant to when sending the mails for the new authors
    //     this.posterToUpdate.authors =
    //         await this.postersService.posterAuthorsToUsers({
    //             ...this.posterToUpdate,
    //             tenant: this.tenant,
    //             user: this.user,
    //         } as PosterAuthorsToUsersArgs)
    // }

    private getRemovedAuthors() {
        return differenceBy(
            this.posterBeforeUpdate.authors,
            this.posterToUpdate.authors,
            (obj) => obj.id,
        )
    }

    // private async handleNewAuthors() {
    //     const mainAuthor = this.posterBeforeUpdate.user
    //
    //     const authors = this.getNewAuthors()
    //
    //     if (authors.length && mainAuthor && this.posterBeforeUpdate.tenant?.id)
    //         await this.notifyCoAuthors(
    //             authors,
    //             mainAuthor,
    //             this.posterToUpdate.title,
    //             this.posterBeforeUpdate.id,
    //             this.posterBeforeUpdate.tenant,
    //         )
    // }

    private getNewAuthors(): UpdateAuthorDto[] {
        const newAuthors = differenceBy(
            this.posterToUpdate.authors,
            this.posterBeforeUpdate.authors,
            (obj) => obj.id,
        )
        // Remove the owner
        return newAuthors.filter(
            (member) => member.id !== this.posterBeforeUpdate.user.id,
        )
    }

    // private async notifyCoAuthors(
    //     authors: UpdateAuthorDto[],
    //     mainAuthor: UpdateAuthorDto,
    //     documentTitle: string,
    //     documentId: number,
    //     tenant: Tenant,
    // ): Promise<void> {
    //     const actionUrl = await this.createDocumentURL(documentId)
    //     // TODO: Use a queue
    //     await Promise.all(
    //         authors.map((author) => {
    //             if (!author.isDummyUser) {
    //                 const mail = new EmailAuthorNotificationMail({
    //                     mainAuthorFullName:
    //                         mainAuthor.firstName + ' ' + mainAuthor.lastName,
    //                     coAuthorFullName:
    //                         author.firstName + ' ' + author.lastName,
    //                     documentTitle,
    //                     tenantName: tenant.name,
    //                     actionUrl,
    //                 })
    //                 return this.mailService.sendMail(
    //                     mail,
    //                     author.email,
    //                     tenant.id,
    //                 )
    //             }
    //         }),
    //     )
    // }

    // private async createDocumentURL(poster: number): Promise<string> {
    //     const origin = await this.tenantService.findTenantUrl(this.tenant)
    //     return `${origin}/gallery/${poster}/info`
    // }
    //
    // private isDifferent(keys: string[]) {
    //     return (
    //         get(this.posterBeforeUpdate, keys) !==
    //         get(this.posterToUpdate, keys)
    //     )
    // }
}
