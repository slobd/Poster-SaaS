import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Workspace } from '@prisma/client'
import { FindWorkspacesDto } from '../dto/find-workspaces.dto'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'

@Injectable()
export class WorkspacesGetHandler {
    constructor(private readonly prisma: PrismaService) {}

    async handle(
        query: FindWorkspacesDto,
        user: SanitizedUserDto,
    ): Promise<Workspace[]> {
        return this.prisma.workspace.findMany({
            where: {
                tenantId: query.tenantId,
                name: { contains: query.search, mode: 'insensitive' },
                users: { some: { id: user.id } },
                deleted: false,
            },
        })
    }
}
