import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { SanitizedExpertDto } from '@/iam/users/dto/sanitized-expert'
import { WorkspacePeopleService } from '@/workspace/workspace-people/workspace-people.service'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { ApiTags } from '@nestjs/swagger'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { SendMessageDto } from '../dto/send-message.dto'
import { User } from '@/utils/decorators/user.decorator'

@Controller('workspaces')
@ApiTags('Workspaces - People')
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class WorkspacePeopleController {
    constructor(
        private readonly workspacePeopleService: WorkspacePeopleService,
    ) {}

    @Get(':id/people/:userId')
    @UseGuards(JwtAuthGuard)
    @Policy({
        action: ActionEnum.read,
        subject: SubjectEnum.User,
    })
    async findOneUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) workspaceId: number,
        @User() user: SanitizedUserDto,
    ): Promise<SanitizedUserDto> {
        return this.workspacePeopleService.findOneUser(userId, workspaceId, user)
    }

    @Get(':id/people')
    @UseGuards(JwtAuthGuard)
    @Policy({
        action: ActionEnum.list,
        subject: SubjectEnum.User,
        evaluateReadForListAction: false,
        informationProvider: { entity: SubjectEnum.Workspace },
    })
    async findPeople(
        @Param('id', ParseIntPipe) workspaceId: number,
    ): Promise<SanitizedUserDto[]> {
        return this.workspacePeopleService.findPeople(workspaceId)
    }

    @Get(':id/recommended/:userId')
    @UseGuards(JwtAuthGuard)
    @Policy({
        action: ActionEnum.list,
        subject: SubjectEnum.User,
        evaluateReadForListAction: false,
        informationProvider: { entity: SubjectEnum.Workspace },
    })
    async recommendPeer(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) workspaceId: number,
    ): Promise<SanitizedExpertDto[]> {
        return this.workspacePeopleService.recommendPeer(userId, workspaceId)
    }

    @Post(':id/message/:userId')
    @UseGuards(JwtAuthGuard)
    async sendMessage(
        @Param('userId', ParseIntPipe) receiverId: number,
        @Param('id', ParseIntPipe) workspaceId: number,
        @User() sender: SanitizedUserDto,
        @Body() body: SendMessageDto,
    ): Promise<void> {
        return this.workspacePeopleService.sendMessage(
            receiverId,
            workspaceId,
            sender,
            body,
        )
    }
}
