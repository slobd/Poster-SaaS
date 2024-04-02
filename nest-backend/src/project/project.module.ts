import { Module } from '@nestjs/common'
import { ProjectRepository } from './project.repository'
import { ProjectController } from './project.controller'
import { ProjectGetOneHandler } from './handlers/project-get-one.handler'
import { ProjectGetHandler } from './handlers/project-get-handler'
import { ProjectPatchHandler } from './handlers/project-patch.handler'
import { UploadsModule } from '@/uploads/uploads.module'
import { ProjectPostHandler } from './handlers/project-post.handler'

@Module({
    imports: [UploadsModule],
    providers: [
        ProjectRepository,
        ProjectPostHandler,
        ProjectGetOneHandler,
        ProjectGetHandler,
        ProjectPatchHandler,
    ],
    exports: [ProjectRepository],
    controllers: [ProjectController],
})

export class ProjectModule {}
