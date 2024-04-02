import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { UpdateWorkspacesDto } from '@/workspace/dto/update-workspaces.dto'
import { Workspace } from '@prisma/client'
import { PublicInviteHandler } from '@/iam/invite/handlers/public-invite.handler'

@Injectable()
export class WorkspacesPatchHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly publicInviteHandler: PublicInviteHandler,
    ) {}

    async handle(id: number, body: UpdateWorkspacesDto): Promise<Workspace> {
        const currentWorkspace = await this.prisma.workspace.findUnique({
            where: { id },
        })

        if (!currentWorkspace)
            throw new InternalServerErrorException(
                `Failed to update Workspace with Id ${id}`,
            )

        if (currentWorkspace.deleted)
            throw new InternalServerErrorException(
                'This workspace was deleted!',
            )

        await this.handlePublicInvite(body, id)

        try {
            return this.prisma.workspace.update({
                where: { id: id },
                data: {
                    name: body.name,
                    visibility: body.visibility,
                    description: body.description,
                },
            })
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update workspace',
                error,
            )
        }
    }

    private async handlePublicInvite(body: UpdateWorkspacesDto, id: number) {
        if (body?.visibility === 'PUBLIC') {
            const invite = await this.fetchInvite(id)

            if (!invite)
                await this.publicInviteHandler.create({ workspaceId: id })
        } else if (body?.visibility === 'PRIVATE') {
            const invite = await this.fetchInvite(id)

            if (invite) {
                await this.prisma.invite.delete({
                    where: {
                        id: invite.id,
                    },
                })
            }
        }
    }

    private async fetchInvite(id: number) {
        return await this.prisma.invite.findFirst({
            where: {
                email: '*',
                workspaceId: id,
            },
        })
    }
}
