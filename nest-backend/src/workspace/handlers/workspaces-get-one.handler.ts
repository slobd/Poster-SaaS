import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Workspace } from '@prisma/client'

@Injectable()
export class WorkspacesGetOneHandler {
    constructor(private readonly prisma: PrismaService) {}

    async handle(id: number, user: SanitizedUserDto): Promise<Workspace> {
        const workspace = await this.prisma.workspace.findFirst({
            where: {
                id: id,
                users: { some: { id: user.id } },
                deleted: false,
            },
            include: {
                tenant: {
                    include: {
                        roles: {
                            where: {
                                domain: `Workspace/${id}`,
                            },
                        },
                    },
                },
            },
        })

        if (!workspace)
            throw new InternalServerErrorException('Workspace Id is not valid!')

        return workspace
    }
}
