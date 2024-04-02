import { BadRequestException, Injectable } from '@nestjs/common'
import {
    CreateBoardDto,
    CreateBoardDtoTask,
    CreateBoardDtoTaskStatus,
} from '@/board/dto/create-board.dto'
import { BoardRepository } from '@/board/board.repository'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { UpdateBoardDto } from './dto/update-board.dto'
import { TaskService } from '@/task/task.service'
import { Upload } from '@prisma/client'
import { CreateTasksInBoard } from './board.types'
import { POSITION_SCALE } from '@/task/task.constants'

@Injectable()
export class BoardService {
    constructor(
        private readonly boardRepository: BoardRepository,
        private readonly taskService: TaskService,
        private readonly prisma: PrismaService,
    ) {}
    async findOne(id: number) {
        const Status = {
            toDO: { id: 1, name: 'TO DO' },
            inProgress: { id: 2, name: 'IN PROGRESS' },
            review: { id: 3, name: 'REVIEW' },
            done: { id: 4, name: 'DONE' },
        }

        return {
            statuses: [
                Status.toDO,
                Status.inProgress,
                Status.review,
                Status.done,
            ],
            tasks: [],
        }
    }

    private cardsHasInvalidStatus(
        data: CreateBoardDto,
    ): CreateBoardDtoTask | boolean {
        const validStatuses: string[] = data.statuses.map(
            (status: CreateBoardDtoTaskStatus) => status.name,
        )
        const { cards = [] } = data

        return (
            cards.find((card: CreateBoardDtoTask) => {
                if (!validStatuses.includes(card.status as any)) {
                    return card
                }
            }) || false
        )
    }

    private assignStatusToTask(
        board: any,
        cards: CreateBoardDtoTask[],
    ): CreateTasksInBoard[] {
        const statuses: { [key: string]: number } = {}
        board.statuses.forEach(
            (status: CreateBoardDtoTaskStatus & { id: number }) => {
                statuses[status.name] = status.id
            },
        )

        const positionByStatusData: { [key: string]: Prisma.Decimal } = {}
        return (
            cards && cards.map((card) => {
                const { title, description } = card

                /**
                 * Calculating position of status by task
                 */
                const statusId = statuses[card.status]
                let positionByStatus: Prisma.Decimal = new Prisma.Decimal(0)
                if (positionByStatusData[statusId]) {
                    positionByStatusData[statusId].plus(POSITION_SCALE)
                    positionByStatus = positionByStatusData[statusId]
                }
                /** (END) Calculating position for a task */

                return {
                    title,
                    description,
                    positionByStatus,
                    statusId,
                }
            })
        )
    }

    private removeDuplicates(statuses: CreateBoardDtoTaskStatus[]): string[] {
        const uniqueStatuses: string[] = []
        statuses.forEach((status: { name: string }) => {
            if (!uniqueStatuses.includes(status.name)) {
                uniqueStatuses.push(status.name)
            }
        })
        return uniqueStatuses
    }

    async createBoard(data: CreateBoardDto) {
        if (this.cardsHasInvalidStatus(data)) {
            throw new BadRequestException(
                'Cards status not matched with board status array',
            )
        }

        const project = await this.prisma.project.findUnique({
            where: {
                id: data.projectId,
            },
        })

        if (!project) throw new BadRequestException('ProjectId does not exist')

        const payload: Prisma.BoardCreateInput = {
            title: data.title,
            project: {
                connect: {
                    id: project.id,
                },
            },
        }

        if (data.statuses?.length > 0) {
            const uniqueStatuses = this.removeDuplicates(data.statuses)
            payload.statuses = {
                create: uniqueStatuses.map((status) => ({
                    name: status,
                })),
            }
        }
        let board = await this.boardRepository.create(payload)
        if (data.cards?.length > 0 ){
            const tasks = this.assignStatusToTask(board, data.cards)
            board = await this.boardRepository.updateBoardTasks(board.id, tasks)
        }
        return board;
    }

    async updateBoard(id: number, data: UpdateBoardDto) {
        const payload = { title: data.title }
        return this.boardRepository.update(id, payload)
    }

    async deleteBoard(boardId: number) {
        const board = await this.boardRepository.findOne({ id: boardId })

        const attachments: Upload[] = board.tasks.reduce(
            (attachments, task) => {
                return [...attachments, ...task.attachments]
            },
            [],
        )
        await this.boardRepository.delete(board.id)
        return this.handleAttachmentDeletion(attachments)
    }

    private async handleAttachmentDeletion(files: Upload[]) {
        for (const file of files) {
            await this.taskService.deleteAttachment(file)
        }
    }
}
