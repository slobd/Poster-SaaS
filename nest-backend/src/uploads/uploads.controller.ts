import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MulterS3File } from './types/MulterS3File'
import { Upload } from '@prisma/client'
import { UploadRepository } from './upload.repository'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { ApiTags } from '@nestjs/swagger'

@Controller('uploads')
@ApiTags('Uploads')
export class UploadsController {
    constructor(private readonly uploadRepository: UploadRepository) {}

    /**
     * TODO: If used remove the IsDevGuard but add an authorization policy
     * @param file
     */
    @Post()
    @UseGuards(IsDevGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: MulterS3File): Promise<Upload> {
        return await this.uploadRepository.create(file)
    }
}
