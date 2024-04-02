import { Injectable } from '@nestjs/common'
import { CreateLiveSessionDto } from './dto/create-live-session.dto'
import { GenerateJWTTokenDto } from './dto/generate-jwt-token.dto'
import { LiveSessionRepository } from './live-session.repository'
import slugify from 'slugify'
import { LiveSession, LiveSessionStatus } from './entities/live-session.entity'
import { User } from '@/iam/users/entities/user.entity'
import { generateJitsiJwtToken } from '@/utils/jitsi/generateJitsiJwtToken'
import { SuccessResultWith } from '@/live-session/live-session.types'

@Injectable()
export class LiveSessionService {
    constructor(private liveSessionRepository: LiveSessionRepository) {}

    async findAll(): Promise<SuccessResultWith<LiveSession[]>> {
        const data = await this.liveSessionRepository.find({
            where: {
                status: LiveSessionStatus.Ongoing,
            },
            relations: ['user', 'user.avatar'],
        })
        return { status: 'success' as const, data }
    }

    async create(
        createLiveSessionDto: CreateLiveSessionDto,
        user: User,
    ): Promise<SuccessResultWith<LiveSession>> {
        const existingRoom = await this.liveSessionRepository.findOne({
            where: { status: LiveSessionStatus.Ongoing },
        })

        if (existingRoom) {
            throw Error(
                `There already is an ongoing live session. Only one concurrent session is supported right now.`,
            )
        }

        const liveSession = await this.liveSessionRepository.save({
            ...createLiveSessionDto,
            status: LiveSessionStatus.Ongoing,
            slug: slugify(createLiveSessionDto.roomName),
            user: user,
        })

        return { status: 'success', data: liveSession }
    }

    async generateJWTToken(
        jwtDto: GenerateJWTTokenDto,
        user: User,
    ): Promise<
        SuccessResultWith<{
            token: string
            isModerator: boolean
            session: LiveSession
        }>
    > {
        const session = await this.liveSessionRepository.findOne({
            where: { slug: jwtDto.slug, status: LiveSessionStatus.Ongoing },
            relations: ['user'],
        })
        if (!session) {
            throw Error(`Did not find an active room '${jwtDto.slug}'`)
        }

        console.log('session', session)

        const isModerator = session.user?.id === user.id
        const token = await generateJitsiJwtToken(user, isModerator)

        return {
            status: 'success',
            data: {
                token,
                isModerator,
                session,
            },
        }
    }

    async closeSession(id: string): Promise<void> {
        await this.liveSessionRepository.update(id, {
            status: LiveSessionStatus.Ended,
        })
    }
}
