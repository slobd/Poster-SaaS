import { LiveSession } from '../entities/live-session.entity'
import { PickType } from '@nestjs/swagger'

export class GenerateJWTTokenDto extends PickType(LiveSession, [
    'slug',
] as const) {}
