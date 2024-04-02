import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { WorkspaceService } from '@/workspace/workspace.service'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateWorkspaceDto } from '@/workspace/dto/create-workspace.dto'
import { Tenant, WorkspaceVisibilityEnum } from '@prisma/client'
import { ProjectRepository } from '@/project/project.repository'
import { WorkspaceWithTenant } from '@/workspace/workspace.repository'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { PublicInviteHandler } from '@/iam/invite/handlers/public-invite.handler'

@Injectable()
export class WorkspacesPostHandler {
    constructor(
        private readonly workspaceService: WorkspaceService,
        private readonly projectRepository: ProjectRepository,
        private readonly publicInviteHandler: PublicInviteHandler,
        private readonly prisma: PrismaService,
    ) {}

    async handle(
        body: CreateWorkspaceDto,
        user: SanitizedUserDto,
    ): Promise<WorkspaceWithTenant> {
        const tenant = await this.validateTenant(body.tenantId)

        const workspace = await this.createWorkspace(body, tenant, user)

        await this.createDefaultProject(workspace.id, user.id)

        if (workspace.visibility === WorkspaceVisibilityEnum.PUBLIC)
            await this.publicInviteHandler.create({ workspaceId: workspace.id })

        return workspace
    }

    private async validateTenant(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id: tenantId,
            },
        })

        if (!tenant)
            throw new InternalServerErrorException('Tenant Id does not exist')
        return tenant
    }

    private async createWorkspace(
        body: CreateWorkspaceDto,
        tenant: Tenant,
        user: SanitizedUserDto,
    ) {
        const workspaceOwner = await this.prisma.user.findUnique({
            where: {
                id: user.id,
            },
        })
        return this.workspaceService.create(
            {
                name: body.name,
                description: body?.description,
                visibility: body.visibility,
                tenant: tenant,
                users: [workspaceOwner],
            },
            workspaceOwner,
        )
    }

    private async createDefaultProject(workspaceId: number, userId: number) {
        return this.projectRepository.create({
            name: 'Project',
            workspaceId: workspaceId,
            ownerId: userId,
        })
    }
}
