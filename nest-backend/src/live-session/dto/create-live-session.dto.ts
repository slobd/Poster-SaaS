import { LiveSession } from '../entities/live-session.entity'
import { OmitType } from '@nestjs/swagger'

export class CreateLiveSessionDto extends OmitType(LiveSession, [
    'status',
    'id',
    'slug',
    'user',
    'createdAt',
    'updatedAt',
] as const) {}
