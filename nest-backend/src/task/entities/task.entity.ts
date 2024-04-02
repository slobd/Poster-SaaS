import { Prisma, Upload } from '@prisma/client'
import { Status } from '@/board/entities/status.entity'
import { User } from '@/iam/users/entities/user.entity'

export class Task {
    id: number
    title: string
    description: string
    status: Status
    positionByStatus: Prisma.Decimal
    attachments: Upload[]
    assignees: User[]
    dueDate: Date
    createdAt: Date
    updatedAt: Date
}
