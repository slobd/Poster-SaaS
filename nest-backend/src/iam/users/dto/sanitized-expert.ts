import { Poster } from '@/posters/entities/poster.entity'
import { OmitType } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { IsArray, IsNumber, ValidateNested } from 'class-validator'
import { User } from '../entities/user.entity'

class UserActivity {
    @IsNumber()
    documents: number
}

export class SanitizedExpertDto extends OmitType(User, [
    'privacyPolicy',
    'termOfUse',
    'subscribed',
    'posters',
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

    @IsArray()
    keywords: string[]

    @IsArray()
    topics: string[]

    @ValidateNested()
    activity: UserActivity
}
