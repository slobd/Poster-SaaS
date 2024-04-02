import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Patch,
    Query,
    UploadedFiles,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

import { User } from '@/utils/decorators/user.decorator'

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'

import { Poster } from './entities/poster.entity'

import { CreatePosterDto } from './dto/create-poster.dto'
import { FindPosterDto } from './dto/find-poster.dto'
import { UpdatePosterDto } from './dto/update-poster.dto'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { MulterS3FileRecord } from '@/uploads/types/MulterS3File'

import { PosterDto } from '@/posters/poster.repository'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { BaseClass } from '@/utils/shared/base-class'
import { PostersGetHandler } from '@/posters/handlers/posters-get.handler'
import { PostersDeleteHandler } from '@/posters/handlers/posters-delete.handler'
import { PostersPostHandler } from '@/posters/handlers/posters-post.handler'
import { PostersGetOneHandler } from '@/posters/handlers/posters-get-one.handler'
import { PostersPatchHandler } from '@/posters/handlers/posters-patch.handler'

@Controller('workspaces/:workspaceId/posters')
@ApiTags('Posters')
export class PostersController extends BaseClass {
    constructor(
        private readonly postersGetOneHandler: PostersGetOneHandler,
        private readonly postersGetHandler: PostersGetHandler,
        private readonly postersPostHandler: PostersPostHandler,
        private readonly postersPatchHandler: PostersPatchHandler,
        private readonly postersDeleteHandler: PostersDeleteHandler,
    ) {
        super()
    }

    @Get()
    @Policy({
        subject: SubjectEnum.Poster,
        action: ActionEnum.list,
        informationProvider: {
            entity: SubjectEnum.Workspace,
            identifier: 'workspaceId',
        },
    })
    @ApiOperation({
        operationId: 'Poster_find_many',
    })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    async find(
        @Param('workspaceId', ParseIntPipe) workspaceId: number,
        @Query() query: FindPosterDto,
        @User() user: SanitizedUserDto,
    ): Promise<PosterDto[]> {
        /**
         * TODO: This route business logic is not ideal and must be change with a proper
         * refactor of the user stories of the gallery
         * When visibility is private. It returns all the documents where the user is the owner o a coauthor
         */
        const p = await this.postersGetHandler.handle(query, workspaceId, user)

        return p
    }

    @Get(':id')
    @Policy({
        subject: SubjectEnum.Poster,
        action: ActionEnum.read,
    })
    @ApiOperation({
        operationId: 'Poster_find_one',
    })
    @ApiParam({
        name: 'workspaceId',
        required: true,
        schema: { type: 'number' },
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        // @Param('workspaceId', ParseIntPipe) workspaceId: number,
    ): Promise<PosterDto> {
        return this.postersGetOneHandler.handle(id)
    }

    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        operationId: 'Poster_create',
    })
    @Policy({
        subject: SubjectEnum.Poster,
        action: ActionEnum.create,
    })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'pdf', maxCount: 1 },
            { name: 'image', maxCount: 1 },
        ]),
        PolicyEnforcementPointInterceptor,
    )
    async create(
        @Param('workspaceId', ParseIntPipe) workspaceId: number,
        @Body() body: CreatePosterDto,
        @UploadedFiles() files: MulterS3FileRecord,
        @User() user: SanitizedUserDto,
    ): Promise<PosterDto> {
        return this.postersPostHandler.handle(body, files, user)
    }

    @Patch(':id')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        operationId: 'Poster_update',
    })
    @ApiParam({
        name: 'workspaceId',
        required: true,
        schema: { type: 'number' },
    })
    @Policy({
        subject: SubjectEnum.Poster,
        action: ActionEnum.update,
    })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'pdf', maxCount: 1 },
            { name: 'image', maxCount: 1 },
        ]),
        PolicyEnforcementPointInterceptor,
    )
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdatePosterDto,
        @UploadedFiles() files: MulterS3FileRecord,
        @User() user: SanitizedUserDto,
    ): Promise<Poster> {
        return this.postersPatchHandler.handle(id, body, files, user)
    }

    @Delete(':id')
    @ApiOperation({
        operationId: 'Poster_delete',
    })
    @ApiParam({
        name: 'workspaceId',
        required: true,
        schema: { type: 'number' },
    })
    @Policy({
        subject: SubjectEnum.Poster,
        action: ActionEnum.delete,
    })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.postersDeleteHandler.handle(id)
    }
}
