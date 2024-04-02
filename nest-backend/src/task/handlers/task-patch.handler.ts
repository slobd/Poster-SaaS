import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { AssigneeDto, UpdateTaskDto } from '@/task/dto/update-task.dto'
import { Prisma, Task, User, Board } from '@prisma/client'
import { task } from '@/task/task.types'
import { INVALID_STATUS_ERROR } from '@/task/task.errors'
import { WorkspacePeopleService } from '@/workspace/workspace-people/workspace-people.service'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'

@Injectable()
export class TaskPatchHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly workspacePeopleService: WorkspacePeopleService,
    ) {}

    async handle(id: number, body: UpdateTaskDto, authenticatedUser: SanitizedUserDto): Promise<void> {
        const currentTask = await this.fetchCurrenTask(id)

        if (body.assignees && body.assignees.length > 0)
            await this.validateAssignees(
                body.assignees,
                currentTask.board.project.workspaceId,
                authenticatedUser
            )

        const currTaskUpdateInput: Prisma.TaskUpdateInput = {
            title: body.title,
            description: body.description,
            positionByStatus: body.positionByStatus,
            status: body.statusId
                ? {
                      connect: {
                          id: body.statusId,
                      },
                  }
                : undefined,
            dueDate: body.dueDate ? body.dueDate : null,
            assignees:
                body.assignees && body.assignees.length > 0
                    ? {
                          set: [],
                          connect: body.assignees,
                      }
                    : body.assignees && currentTask.assignees.length > 0
                    ? { set: [] }
                    : undefined,
        }

        await this.validateStatus(body, id)

        await this.prisma.task.update({
            where: {
                id,
            },
            data: currTaskUpdateInput,
            ...task,
        })
    }

    private async fetchCurrenTask(id: number): Promise<
        Task & {
            assignees: User[]
            board: Board & { project: { id: number; workspaceId: number } }
        }
    > {
        const task = await this.prisma.task.findUnique({
            where: {
                id: id,
            },
            include: {
                assignees: true,
                board: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                workspaceId: true,
                            },
                        },
                    },
                },
            },
        })
        if (!task) throw new InternalServerErrorException('Task Id is invalid')

        return task
    }

    private async validateAssignees(
        assignees: AssigneeDto[],
        workspaceId: number,
        authenticatedUser: SanitizedUserDto
    ): Promise<boolean> {
        for (const assignee of assignees) {
            const user = await this.workspacePeopleService.findOneUser(
                assignee.id,
                workspaceId,
                authenticatedUser
            )
            if (!user)
                throw new InternalServerErrorException(
                    'Assignee user Id does not exist or is not part of the workspace',
                )
        }
        return true
    }

    private async validateStatus(body: UpdateTaskDto, id: number) {
        if (body.statusId) {
            const task = await this.prisma.task.findUnique({ where: { id } })
            const status = await this.prisma.taskStatus.findUnique({
                where: { id: body.statusId },
            })
            if (task.boardId !== status.boardId) throw INVALID_STATUS_ERROR
        }
    }
}
