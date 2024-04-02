import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { LiveSessionService } from './live-session.service'
import { CreateLiveSessionDto } from './dto/create-live-session.dto'
import { GenerateJWTTokenDto } from './dto/generate-jwt-token.dto'
import { LiveSession } from './entities/live-session.entity'
import { SuccessResultWith } from '@/live-session/live-session.types'
import { User } from '@/utils/decorators/user.decorator'
import { User as UserType } from '@/iam/users/entities/user.entity'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'

@UseGuards(IsDevGuard)
@Controller('live-session')
@ApiTags('Live Session')
export class LiveSessionController {
    constructor(private readonly liveSessionService: LiveSessionService) {}

    @Post()
    // @Policy(permissions.LIVE_SESSION.CREATE)
    @ApiOperation({
        operationId: 'Live_session_create',
    })
    async create(
        @Body() createLiveSessionDto: CreateLiveSessionDto,
        @User() user: UserType,
    ): Promise<SuccessResultWith<LiveSession>> {
        return await this.liveSessionService.create(createLiveSessionDto, user)
    }

    @Post('/generate-token')
    async generateJWTtoken(
        @Body() jwtDto: GenerateJWTTokenDto,
        @User() user: UserType,
    ): ReturnType<LiveSessionService['generateJWTToken']> {
        return this.liveSessionService.generateJWTToken(jwtDto, user)
    }

    @Get()
    // @Policy(permissions.LIVE_SESSION.READ_ALL)
    @ApiOperation({
        operationId: 'Live_session_fetch',
    })
    async findAll(): ReturnType<LiveSessionService['findAll']> {
        return this.liveSessionService.findAll()
    }

    /**
     * Should a PATCH update route.
     * @param id
     */
    @Post('/close')
    // @Policy(permissions.LIVE_SESSION.EDIT)
    @ApiOperation({
        operationId: 'Live_session_close',
    })
    async closeSession(@Body() id: string): Promise<void> {
        return this.liveSessionService.closeSession(id)
    }
}
