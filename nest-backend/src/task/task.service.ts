import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { MulterS3File } from '@/uploads/types/MulterS3File'
import { Upload } from '@prisma/client'
import { UploadsService } from '@/uploads/uploads.service'

@Injectable()
export class TaskService {
    constructor(private readonly uploadsService: UploadsService) {}

    async uploadAttachments(file: MulterS3File): Promise<Upload> {
        try {
            return this.uploadsService.save(file)
        } catch (e) {
            throw new InternalServerErrorException('Attachment upload failed')
        }
    }

    async deleteAttachment(upload: Upload): Promise<void> {
        try {
            return this.uploadsService.deleteUpload(upload)
        } catch (e) {
            throw new InternalServerErrorException('Attachment deletion failed')
        }
    }
}
