import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
import { CreateInviteDto } from '@/iam/invite/dto/create-invite.dto'
import { PrivateInviteHandler } from '@/iam/invite/handlers/private-invite.handler'
import { AcceptInviteDto } from '@/iam/invite/dto/accept-invite.dto'
import { PublicInviteHandler } from '@/iam/invite/handlers/public-invite.handler'
import { InviteAcceptHandler } from '@/iam/invite/handlers/invite-accept.handler'
import { Invite } from '@prisma/client'
import { UpdatePublicInviteStatus } from '@/iam/invite/dto/update-public-invite-status.dto'
import { User } from '@/utils/decorators/user.decorator'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { ConfigService } from '@nestjs/config'
import { FindPublicInviteUrlDto } from '@/iam/invite/dto/find-public-Invite-url.dto'
import { ApiTags } from '@nestjs/swagger'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'

@Controller('iam/invite')
@ApiTags('Invites')
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class InviteController {
    constructor(
        private readonly privateInviteHandler: PrivateInviteHandler,
        private readonly publicInviteHandler: PublicInviteHandler,
        private readonly inviteAcceptHandler: InviteAcceptHandler,
        private readonly configService: ConfigService,
    ) {}

    @Get('accept-invite')
    async acceptUserInvitation(
        @Res() res: Response,
        @Query() query: AcceptInviteDto,
    ): Promise<void> {
        await this.inviteAcceptHandler.handle(query)
        const client_url = this.configService.get('CLIENT_URL')
        res.redirect(`${client_url}/auth/invite-accepted`)
    }

    @UseGuards(JwtAuthGuard)
    @Policy({
        action: ActionEnum.read,
        subject: SubjectEnum.Invite,
    })
    @Get('public-invite')
    async fetchPublicInvite(
        @Query() query: FindPublicInviteUrlDto,
    ): Promise<Invite> {
        return this.publicInviteHandler.getPublicInvite(query.workspaceId)
    }

    @UseGuards(JwtAuthGuard)
    @Policy({
        action: ActionEnum.create,
        subject: SubjectEnum.User,
    })
    @Post('')
    async inviteUser(@Body() body: CreateInviteDto): Promise<string> {
        return this.privateInviteHandler.handle(body)
    }

    @UseGuards(JwtAuthGuard)
    @Policy({
        action: ActionEnum.update,
        subject: SubjectEnum.Invite,
    })
    @Patch(':id')
    async updateInvitationStatus(
        @Body() body: UpdatePublicInviteStatus,
        @User() user: SanitizedUserDto,
        @Param('id') _id: string,
    ): Promise<Invite> {
        return this.publicInviteHandler.updateInviteStatus(body, user)
    }
}
