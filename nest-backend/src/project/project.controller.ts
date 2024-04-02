import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { Upload } from '@prisma/client'
import { UpdateProjectDto } from '@/project/dto/update-project.dto'
import { CreateProjectDto } from '@/project/dto/create-project.dto'
import { FindProjectDto } from './dto/find-project.dto'
import { Project } from './project.types'
import { ProjectGetOneHandler } from './handlers/project-get-one.handler'
import { ProjectGetHandler } from './handlers/project-get-handler'
import { ProjectPatchHandler } from './handlers/project-patch.handler'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { ApiConsumes } from '@nestjs/swagger'
import { MulterS3File } from '@/uploads/types/MulterS3File'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadRepository } from '@/uploads/upload.repository'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { ProjectPostHandler } from './handlers/project-post.handler'
import { ApiTags } from '@nestjs/swagger'
import { User } from '@/utils/decorators/user.decorator'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { ProjectRepository } from './project.repository'

@Controller('workspaces/:workspaceId/projects')
@ApiTags('Projects')
export class ProjectController {
    
    constructor(
        private readonly projectPostHandler: ProjectPostHandler,
        private readonly projectGetOneHandler: ProjectGetOneHandler,
        private readonly projectGetHandler: ProjectGetHandler,
        private readonly projectPatchHandler: ProjectPatchHandler,
        private readonly uploadRepository: UploadRepository,
        private readonly projectRepository: ProjectRepository,
    ){}
    

    @Post()
    @UseGuards(JwtAuthGuard)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.create,
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    async create(
        @Body() body: CreateProjectDto,
        @User() user: SanitizedUserDto,
        @Param('workspaceId') _workspaceId: string,
    ): Promise<Project> {
        return this.projectPostHandler.handle(body, user.id)
    }

    @Get(':projectId')
    @UseGuards(JwtAuthGuard)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.read,
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    findOne(
        @Param('workspaceId', ParseIntPipe) _workspaceId: number,
        @Param('projectId', ParseIntPipe) projectId: number,
    ): Promise<Project> {
        return this.projectGetOneHandler.handle(projectId)
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.list,
        informationProvider: {
            entity: SubjectEnum.Workspace,
            identifier: 'workspaceId',
        },
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    findMany(
        @Query() query: FindProjectDto,
        @Param('workspaceId', ParseIntPipe) workspaceId: number,
    ): Promise<Project[]> {
        return this.projectGetHandler.handle(query, workspaceId)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.update,
    })
    async update(
        @Param('workspaceId', ParseIntPipe) _workspaceId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateProjectDto,
    ): Promise<Project> {
        return this.projectPatchHandler.handle(id, body)
    }

    @Patch(':id/uploads')
    @UseGuards(JwtAuthGuard)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.update,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'), PolicyEnforcementPointInterceptor)
    async uploadFile(
        @UploadedFile() file: MulterS3File,
        @Param('workspaceId', ParseIntPipe) _workspaceId: number,
        @Param('id', ParseIntPipe) _id: number,
    ): Promise<Upload> {
        return await this.uploadRepository.create(file)
    }

    @Patch(':id/uploads/:uploadId')
    @UseGuards(JwtAuthGuard)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.update,
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    async deleteUpload(
        @Param('workspaceId', ParseIntPipe) _workspaceId: number,
        @Param('id', ParseIntPipe) _id: number,
        @Param('uploadId', ParseIntPipe) uploadId: number,
    ): Promise<Upload> {
        return this.uploadRepository.delete(uploadId)
    }

    @Delete(':projectId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.delete,
        informationProvider: {
            identifier: 'projectId',
        },
    })
    async delete(
        @Param('workspaceId', ParseIntPipe) _workspaceId: number,
        @Param('projectId', ParseIntPipe) projectId: number,
    ): Promise<Project> {
        return this.projectRepository.delete(projectId)
    }
}
