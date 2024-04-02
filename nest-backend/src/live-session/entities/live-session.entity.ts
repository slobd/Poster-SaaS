import { User } from '@/iam/users/entities/user.entity'
import { Type } from 'class-transformer'

import { IsDefined, IsString } from 'class-validator'

export enum LiveSessionStatus {
    Ongoing = 'Ongoing',
    Ended = 'Ended',
}

export class LiveSession {
    id: string

    @IsDefined()
    @IsString()
    roomName: string

    @IsDefined()
    @IsString()
    slug: string

    @IsDefined()
    status: LiveSessionStatus

    @IsDefined()
    @Type(() => User)
    user: User

    createdAt: Date

    updatedAt: Date
}
