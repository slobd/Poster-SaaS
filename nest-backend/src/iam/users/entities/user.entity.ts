import { IsTrue } from '@/utils/validation/is-true.validator'
import { IsEmail, IsOptional, IsString } from 'class-validator'
import { Column } from 'typeorm'
import { Upload } from '@/uploads/upload.entity'
import {
    Role,
    UserDirectory,
    User as PrismaUser,
    Poster,
    Comment,
    Skill,
} from '@prisma/client'

export class User implements PrismaUser {
    id: number

    objectId: string

    @IsOptional()
    organizationName: string | null

    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsEmail()
    @Column({ unique: true })
    email: string

    @Column({ default: false })
    isDummyUser: boolean

    @Column({ default: false })
    subscribed: boolean

    @IsTrue()
    privacyPolicy: boolean

    @IsTrue()
    termOfUse: boolean

    // Allow users to enable/disable global notifications
    disableNotifications: boolean

    linkedin: string

    researchGate: string

    twitter: string

    currentPosition: string | null

    biography: string | null

    createdAt: Date

    updatedAt: Date

    avatarId: number | null

    avatar?: Upload

    posters?: Poster[]

    authoredPosters?: Poster[]

    roles?: Role[]

    comments?: Comment[]

    userDirectory?: UserDirectory

    constructor(partial: Partial<User>) {
        Object.assign(this, partial)
    }

    skills?: Skill[]
}
