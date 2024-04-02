import { User } from '@/iam/users/entities/user.entity'
import { InitCreateUtil } from 'test/utils/types'
import { DeepPartial } from 'typeorm'
import { Poster } from '@/posters/entities/poster.entity'
import { Tenant } from '@/tenant/entities/tenant.entity'
import { GUEST } from '@/iam/iam.constants'
import { Upload } from '@/uploads/upload.entity'
import { PosterVisibilityEnum, Role, Comment } from '@prisma/client'

export const initCreateTestUser: InitCreateUtil<User> =
    (userRepository) => async (user) => {
        const defaultData: DeepPartial<User> = {
            firstName: 'John1',
            lastName: 'Doe1',
            email: 'test1@email.com',
            privacyPolicy: true,
            subscribed: false,
            termOfUse: true,
            organizationName: 'PosterLab',
        }

        return userRepository.save({
            ...defaultData,
            ...user,
        })
    }

export const initCreateTestUpload: InitCreateUtil<Upload> =
    (uploadRepository) => async (upload) => {
        const defaultUpload: DeepPartial<Upload> = {
            fieldname: 'pdf',
            originalname: 'TestDocument.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            size: 28828,
            bucket: 'posterlab-development',
            key: 'demopdf.pdf',
            location:
                'https://posterlab-development.s3.eu-central-1.amazonaws.com/demopdf.pdf',
            acl: 'public-read',
            contentType: 'application/pdf',
            storageClass: 'STANDARD',
            etag: '38822579aed57a6f287d8ded58315e80',
        }
        return uploadRepository.save({
            ...defaultUpload,
            ...upload,
        })
    }

export const initCreateTestPoster: InitCreateUtil<Poster> =
    (posterRepository) => async (poster) => {
        const defaultData: DeepPartial<Poster> = {
            user: {},
            title: 'Real Poster',
            visibility: PosterVisibilityEnum.PUBLIC,
            authors: [{}],
            pdf: {},
            image: {},
        }

        return posterRepository.save({
            ...defaultData,
            ...poster,
        })
    }

export const initCreateTestTenant: InitCreateUtil<Tenant> =
    (tenantRepository) => async (tenant) => {
        const defaultData: DeepPartial<Tenant> = {
            name: 'Tenant 5',
            host: 'localhost:3005',
        }

        return tenantRepository.save({
            ...defaultData,
            ...tenant,
        })
    }

export const initCreateTestRole: InitCreateUtil<Role> =
    (roleRepository) => async (role) => {
        const defaultData: DeepPartial<Role> = {
            name: GUEST,
        }

        return roleRepository.save({
            ...defaultData,
            ...role,
        })
    }

export const initCreateTestComment: InitCreateUtil<Comment> =
    (commentRepository) => async (comment) => {
        const defaultData: DeepPartial<Comment> = {
            content: 'common text',
            authorId: 1,
            posterId: 1,
        }

        return commentRepository.save({
            ...defaultData,
            ...comment,
        })
    }
