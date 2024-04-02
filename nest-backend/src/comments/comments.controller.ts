import { CreateCommentData } from './dto/create-comment.dto'
import { CommentFindMany, CommentsService } from './comments.service'
import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { CurrentTenant } from '@/utils/decorators/tenant.decorator'
import { Tenant as TenantEntity } from '@/tenant/entities/tenant.entity'
import { User } from '@/utils/decorators/user.decorator'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { Comment } from '@prisma/client'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { ApiTags } from '@nestjs/swagger'

@Controller('posters/:posterId')
@ApiTags('Comments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class CommentsController {
    constructor(readonly commentsService: CommentsService) {}

    // Same in the frontend
    // Give permission to workspace roles
    @Post('comments')
    @Policy({
        subject: SubjectEnum.Comment,
        action: ActionEnum.create,
    })
    async create(
        @Body() body: CreateCommentData,
        @CurrentTenant() tenant: TenantEntity,
        @User() user: SanitizedUserDto,
        @Param('posterId', ParseIntPipe) _posterId: number,
    ): Promise<Comment> {
        return await this.commentsService.create(body, tenant, user.id)
    }

    // Same in the frontend
    // Give permission to workspace roles
    @Get('comments')
    @Policy({
        subject: SubjectEnum.Comment,
        action: ActionEnum.list,
        evaluateReadForListAction: false,
        informationProvider: {
            entity: SubjectEnum.Poster, //
            identifier: 'posterId',
        },
    })
    async find(
        @Param('posterId', ParseIntPipe) posterId: number,
    ): Promise<CommentFindMany[]> {
        return this.commentsService.find(posterId)
    }

    @Delete('comments/:commentId')
    @Policy({
        subject: SubjectEnum.Comment,
        action: ActionEnum.delete,
        informationProvider: {
            identifier: 'commentId',
        },
    })
    async delete(
        @Param('commentId', ParseIntPipe) id: number,
        @Param('posterId', ParseIntPipe) _posterID: number,
    ): Promise<void> {
        const comment = await this.commentsService.findOne(id)

        if (!comment) {
            throw new NotFoundException()
        }

        return this.commentsService.delete(id)
    }
}
