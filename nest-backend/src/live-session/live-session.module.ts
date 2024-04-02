import { Module } from '@nestjs/common'
import { LiveSessionService } from './live-session.service'
import { LiveSessionController } from './live-session.controller'
import { LiveSessionRepository } from './live-session.repository'
import { UsersModule } from '@/iam/users/users.module'

@Module({
    imports: [UsersModule],
    controllers: [LiveSessionController],
    providers: [LiveSessionService, LiveSessionRepository],
})
export class LiveSessionModule {}
