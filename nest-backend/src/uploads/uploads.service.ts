import { AwsS3Service } from '@/aws/aws-s3.service'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as fs from 'fs'
import { S3 } from 'aws-sdk'
import { ObjectCannedACL } from 'aws-sdk/clients/s3'
import * as Encoding from 'encoding-japanese'
import * as mime from 'mime-types'
import { ConfigService } from '@nestjs/config'
import { UploadRepository } from '@/uploads/upload.repository'
import { omit } from 'lodash'
import { Upload } from '@prisma/client'

type UploadWithoutForeignKeys = Omit<Upload, 'informationTabId'>

type UploadWithoutKeys = Omit<Upload, 'informationTabId' | 'id' | 'taskId'>

export type UploadSave = {
    [key in keyof UploadWithoutKeys]: null extends Upload[key]
        ? NonNullable<Upload[key]> | undefined
        : Upload[key]
} & { id?: number }

@Injectable()
export class UploadsService {
    constructor(
        private readonly uploadRepository: UploadRepository,
        private readonly awsS3Service: AwsS3Service,
        private readonly configService: ConfigService,
    ) {}

    async save(data: UploadSave): Promise<Upload> {
        if (data.id) {
            return this.uploadRepository.update(data.id, omit(data, 'id'))
        }
        return this.uploadRepository.create(data)
    }

    async deleteUpload(asset: UploadWithoutForeignKeys): Promise<void> {
        if (!asset.id || !asset.key)
            throw new InternalServerErrorException(
                `Do not know how to delete asset. Missing either Key: ${asset.key} or Id: ${asset.id}`,
            )
        try {
            await this.awsS3Service.deleteObject({
                Bucket: this.configService.get<string>('S3_BUCKET'),
                Key: asset.key,
            })
        } catch (error) {
            throw new InternalServerErrorException(
                'Error while deleting object from awsS3',
            )
        }

        await this.uploadRepository.delete(asset.id)

        return null
    }

    async uploadfromLocal(
        path: string,
        bucket: string,
        key: string,
        acl: ObjectCannedACL = 'public-read',
    ): Promise<Upload | void> {
        const body = fs.createReadStream(path)

        const mimetype: string | boolean = mime.lookup(path)

        if (!mimetype) {
            throw 'error'
        }

        const contentType: string = mime.contentType(mimetype) as string

        const params: S3.PutObjectRequest = {
            Body: body,
            Bucket: bucket,
            Key: key,
            ACL: acl,
            ContentType: contentType,
            Metadata: undefined,
        }

        const res = await this.awsS3Service.upload(params)

        let encoding: string
        const buf = fs.readFileSync(path)
        const encodingType = Encoding.detect(Buffer.from(buf))
        if (typeof encodingType === 'string') {
            encoding = encodingType
        }

        if (res) {
            const uploadInfo: UploadSave = {
                fieldname: null,
                originalname: res.Key,
                encoding: encoding,
                contentEncoding: encoding,
                mimetype: mimetype as string,
                bucket: res.Bucket,
                key: res.Key,
                acl: acl,
                contentType: contentType,
                location: res.Location,
                etag: res.ETag,
                size: fs.statSync(path)['size'],
                serverSideEncryption: null,
                metadata: undefined,
                storageClass: 'STANDARD',
                contentDisposition: null,
            }
            return this.save(uploadInfo)
        } else {
            return null
        }
    }
}
