import faker from 'faker'
import { UploadResponse } from '~/types/entities/Upload.entity'

export const mockPosterUploads: {
    image: UploadResponse
    pdf: UploadResponse
}[] = [
    {
        image: {
            id: faker.datatype.number(),
            fieldname: faker.system.fileName(),
            originalname: faker.system.commonFileName(),
            encoding: 'UTF32',
            mimetype: 'image/png',
            size: faker.datatype.number({ min: 3000000 }),
            bucket: 'posterlab-development',
            key: '1618409156157santi@posterlab.coimage Kaouthar.png',
            acl: 'public-read',
            contentType: 'image/png',
            contentDisposition: undefined,
            storageClass: faker.lorem.word().toUpperCase(),
            serverSideEncryption: undefined,
            metadata: faker.system.mimeType(),
            location: faker.image.business(),
            etag: `"${faker.datatype.string('fdd213badecc27874e1d37035aa29bd1'.length)}"`,
            versionId: `"${faker.datatype.uuid()}"`,
        },
        pdf: {
            id: faker.datatype.number(),
            fieldname: faker.system.fileName(),
            originalname: faker.system.commonFileName(),
            encoding: 'UTF32',
            mimetype: 'application/pdf',
            size: faker.datatype.number({ min: 3000000 }),
            bucket: 'posterlab-development',
            key: '1618409155700santi@posterlab.coposter Slama Kaouthar.pdf',
            acl: 'public-read',
            contentType: 'application/pdf',
            contentDisposition: undefined,
            storageClass: 'STANDARD',
            serverSideEncryption: undefined,
            metadata: undefined,
            location: faker.image.business(),
            etag: `"${faker.datatype.string('fdd213badecc27874e1d37035aa29bd1'.length)}"`,
            versionId: `"${faker.datatype.uuid()}"`,
        },
    },
]

export const mockImageTemplate = (type: 'avatar' | 'image'): UploadResponse => {
    if (type === 'avatar')
        return {
            url: faker.internet.avatar(),
            id: faker.datatype.number(),
            size: faker.datatype.number(),
            acl: 'public-read',
            location: faker.internet.avatar(),
            originalname: faker.system.fileName(),
            bucket: 'posterlab-development',
            contentType: 'application/png',
            mimetype: 'image/png',
            encoding: 'UTF32',
            etag: faker.datatype.uuid(),
            key: faker.system.fileName(),
            storageClass: 'STANDARD',
        }

    return {
        url: faker.image.business(),
        id: faker.datatype.number(),
        size: faker.datatype.number(),
        acl: 'public-read',
        location: faker.image.business(),
        originalname: faker.system.fileName(),
        bucket: 'posterlab-development',
        contentType: 'application/png',
        mimetype: 'image/png',
        encoding: 'UTF32',
        etag: faker.datatype.uuid(),
        key: faker.system.fileName(),
        storageClass: 'STANDARD',
    }
}

export const mockImages = (count = 1): UploadResponse[] => {
    const images: UploadResponse[] = []

    for (let index = 0; index < count; index++) {
        const image = mockImageTemplate('image')
        images.push(image)
    }
    return images
}
