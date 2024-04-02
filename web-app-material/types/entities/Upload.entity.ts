export interface Format {
    ext: string
    url: string
    hash: string
    mime: string
    name: string
    path: string | null
    size: number
    width: number | null
    height: number | null
}

export interface Upload extends Omit<Format, 'path'> {
    id: number
    name: string
    alternativeText: string
    caption: string
    formats: null | {
        small?: Format
        medium?: Format
        thumbnail?: Format
    }
}

export interface UploadResponse {
    id: number
    fieldname?: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    bucket: string
    key: string
    acl: string
    contentType: string
    contentDisposition?: string
    storageClass: string
    serverSideEncryption?: string
    metadata?: any
    location: string
    etag: string
    versionId?: string
    url?: string
}
