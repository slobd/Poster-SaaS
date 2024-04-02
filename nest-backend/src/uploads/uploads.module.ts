import { Module } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { MulterModule } from '@nestjs/platform-express'
import { UploadsController } from './uploads.controller'
import * as multerS3 from 'multer-s3'
import * as S3 from 'aws-sdk/clients/s3'
import { Request } from 'express'
import { AwsModule } from '@/aws/aws.module'
import { UploadRepository } from '@/uploads/upload.repository'

const s3 = new S3({
    region: 'eu-central-1',
})

@Module({
    imports: [
        MulterModule.register({
            storage: multerS3({
                s3: s3,
                acl: 'public-read',
                bucket(req, file, cb) {
                    const bucket = process.env.S3_BUCKET

                    cb(null, bucket)
                },
                // process.env.S3_BUCKET,
                contentType: multerS3.AUTO_CONTENT_TYPE,
                key(req: Request, file, cb) {
                    // TODO: Find a better solution to prevent (https://github.com/expressjs/multer/issues/146) or create an S3 module

                    const splitFileName = file.originalname.split('.')
                    const fileEnding = splitFileName[splitFileName.length - 1]
                    // TODO: Add line endings validator
                    cb(null, Date.now().toString() + '.' + fileEnding)
                    // cb(null, 'test' + '.' + fileEnding)
                },
                metadata(
                    req: Express.Request,
                    file: Express.Multer.File,
                    callback: (error: any, metadata?: any) => void,
                ) {
                    callback(null, undefined)
                },
            }),
            limits: {
                fieldSize: 20000000, // 20mb in bytes
            },
        }),
        AwsModule,
    ],
    providers: [UploadsService, UploadRepository],
    controllers: [UploadsController],
    exports: [MulterModule, UploadsService, UploadRepository],
})
export class UploadsModule {}
