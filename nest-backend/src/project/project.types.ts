import { Prisma } from '@prisma/client'

export const project = Prisma.validator<Prisma.ProjectArgs>()({
    select: {
        id: true,
        name: true,
        visibility: true,
        deleted: true,
        workspaceId: true,
        workspace: true,
        ownerId: true,
        boards: {
            select: {
                id: true,
                title: true,
            },
        },
        informationTabs: {
            include: {
                topics: true,
                keywords: true,
                attachments: true,
                project: false,
            },
        },
    },
})

export type Project = Prisma.ProjectGetPayload<typeof project>
