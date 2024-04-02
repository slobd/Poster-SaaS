import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Tenant, User, WorkspaceVisibilityEnum } from '@prisma/client'

const workspaceWithTenant = Prisma.validator<Prisma.WorkspaceArgs>()({
    include: {
        tenant: true,
    },
})

export type WorkspaceWithTenant = Prisma.WorkspaceGetPayload<
    typeof workspaceWithTenant
>

export interface CreateWorkspaceArgs {
    name: string
    description: string
    visibility: WorkspaceVisibilityEnum
    tenant: Tenant
    users: User[]
}

@Injectable()
export class WorkspaceRepository {
    constructor(private prisma: PrismaService) {}

    async create(workspace: CreateWorkspaceArgs): Promise<WorkspaceWithTenant> {
        return this.prisma.workspace.create({
            data: {
                name: workspace.name,
                description: workspace.description ? workspace.description : '',
                visibility: workspace.visibility,
                deleted: false,
                tenant: {
                    connect: {
                        id: workspace.tenant.id,
                    },
                },
                users: {
                    connect: workspace.users.map((u) => ({ id: u.id })),
                },
            },
            include: {
                tenant: true,
            },
        })
    }
}
