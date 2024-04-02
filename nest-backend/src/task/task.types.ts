import { Prisma } from '@prisma/client'

export const task = Prisma.validator<Prisma.TaskArgs>()({
    include: {
        status: true,
        attachments: true,
        assignees: true,
    },
})

export type Task = Prisma.TaskGetPayload<typeof task>
