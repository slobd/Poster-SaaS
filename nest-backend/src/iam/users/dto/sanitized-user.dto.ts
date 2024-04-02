import { Poster } from '@/posters/entities/poster.entity'
import { OmitType } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { User } from '../entities/user.entity'
import { Upload } from '@/uploads/upload.entity'

export type SanitizedUserDto = Omit<
    User,
    | 'password'
    | 'resetPasswordToken'
    | 'confirmed'
    | 'privacyPolicy'
    | 'termOfUse'
    | 'subscribed'
    | 'posters'
    | 'avatar'
    | 'userDirectory'
>

export class SanitizedUserDtoClass extends OmitType(User, [
    'privacyPolicy',
    'termOfUse',
    'subscribed',
    'posters',
    'avatar',
]) {
    @Exclude()
    password: string

    @Exclude()
    resetPasswordToken: string

    @Exclude()
    termOfUse: boolean

    @Exclude()
    privacyPolicy: boolean

    @Exclude()
    confirmed: boolean

    @Exclude()
    subscribed: boolean

    @Exclude()
    posters: Poster[]

    @Exclude()
    avatar: Upload
}
