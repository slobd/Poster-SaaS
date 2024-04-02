import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Workspace } from '@prisma/client'

@Injectable()
export class WorkspacesDeleteHandler {
    constructor(private readonly prisma: PrismaService) {}

    async handle(id: number): Promise<Workspace> {
        try {
            return this.prisma.workspace.update({
                where: { id },
                data: {
                    deleted: true,
                },
            })
        } catch (e) {
            throw new InternalServerErrorException(
                `Failed to delete Workspace with Id ${id}`,
            )
        }
    }
}
