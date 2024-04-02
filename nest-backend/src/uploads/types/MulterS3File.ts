export type MulterS3File = Omit<
    Express.MulterS3.File,
    | 'stream'
    | 'destination'
    | 'filename'
    | 'path'
    | 'buffer'
    | 'serverSideEncryption'
    | 'contentDisposition'
> & {
    serverSideEncryption: string
    contentDisposition: string
    contentEncoding: string
    versionId?: string
}

export type MulterS3FileRecord = Partial<MulterS3File[]>
