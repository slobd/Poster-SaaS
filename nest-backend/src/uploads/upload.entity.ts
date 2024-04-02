import { MulterS3File } from './types/MulterS3File'

export class Upload implements MulterS3File {
    id: number

    fieldname: string

    originalname: string

    encoding: string

    contentEncoding: string

    mimetype: string

    size: number

    bucket: string

    key: string

    acl: string

    contentType: string

    contentDisposition: string

    storageClass: string

    serverSideEncryption: string

    metadata: any

    location: string

    etag: string

    versionId: string
}
