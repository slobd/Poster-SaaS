import { AppModule } from '@/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import {
    requestFactory,
    RequestUtil,
    Response,
    TestBoard,
    TestProject,
} from './utils/request-factory.util'
import { setupTest } from './utils/setup-test'
import { CreateBoardDto } from '@/board/dto/create-board.dto'
import { HttpStatus } from '@nestjs/common'
import { UpdateBoardDto } from '@/board/dto/update-board.dto'
import { PrismaService } from '@/prisma/prisma.service'
import { Board, board } from '@/board/board.types'

describe('Boards Module', () => {
    let app: NestExpressApplication
    let request: RequestUtil
    let prisma: PrismaService

    let project: TestProject
    let testBoard: TestBoard

    let server: any
    let defaultData: CreateBoardDto

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = await setupTest(moduleFixture)

        await app.init()

        server = app.getHttpServer()

        request = await requestFactory(app, moduleFixture)

        project = request.getProject()

        prisma = app.get(PrismaService)
        defaultData = {
            title: 'kanban board',
            projectId: 1,
            project: {
                visibility: 'PUBLIC',
                workspaceId: 1,
            },
            name: '4-Step Kanban Board',
            description:
                'Generic template for a simple process for activities in 4-Steps. Source: Generic',
            statuses: [
                {
                    name: 'To do',
                },
                {
                    name: 'In progress',
                },
                {
                    name: 'Review',
                },
                {
                    name: 'Done',
                },
            ],
            cards: [
                {
                    title: 'Name of the task 1',
                    description: '',
                    status: 'To do',
                },
                {
                    title: 'Name of the task 2',
                    description: '',
                    status: 'To do',
                },
                {
                    title: 'Name of the task 3',
                    description: '',
                    status: 'To do',
                },
                {
                    title: 'Name of the task 4',
                    description: '',
                    status: 'To do',
                },
                {
                    title: 'Name of the task 5',
                    description: '',
                    status: 'To do',
                },
            ],
        } as any
    })

    async function createBoard(
        customData: Partial<CreateBoardDto> = {},
    ): Promise<Response<Board>> {
        const res = await request(
            {
                method: 'post',
                url: '/boards',
                data: {
                    ...defaultData,
                    ...customData,
                },
            },
            server,
        )

        expect(res.status).toEqual(HttpStatus.CREATED)

        testBoard = res.body
        return res
    }

    async function findBoard(id: number): Promise<Board> {
        return prisma.board.findUnique({
            where: { id },
            ...board,
        })
    }

    async function updateBoard(
        id: number,
        customData: Partial<UpdateBoardDto> = {},
    ): Promise<Board> {
        const res = await request(
            {
                method: 'patch',
                url: `/boards/${id}`,
                data: {
                    ...defaultData,
                    ...customData,
                },
            },
            server,
        )

        expect(res.status).toEqual(HttpStatus.OK)
        return await findBoard(id)
    }

    async function deleteBoard(id: number): Promise<Response<void>> {
        const res = await request(
            {
                method: 'delete',
                url: `/boards/${id}`,
            },
            server,
        )

        expect(res.status).toEqual(HttpStatus.OK)

        return res
    }

    afterEach(async () => {
        await prisma.board.deleteMany({
            where: { id: testBoard.id },
        })
    })

    afterAll(async () => {
        await app.close()
        await server.close()
    })

    describe('POST /boards', () => {
        test('Create a board', async () => {
            const board: CreateBoardDto = {
                title: 'title',
                projectId: 1,
                project,
            }
            const { body } = await createBoard(board)

            expect(body).toBeDefined()
            expect(typeof body.id).toBe('number')
            expect(body.id).toBeNumber()
            expect(body.title).toBe(board.title)
            expect(body.projectId).toBe(board.projectId)
            expect(body.tasks.length).toBe(5)
            expect(body.statuses.length).toBe(4)
            expect(body.statuses.map((status) => status.name)).toEqual([
                'To do',
                'In progress',
                'Review',
                'Done',
            ])
            expect(body.tasks.map((task) => task.title)).toEqual([
                'Name of the task 1',
                'Name of the task 2',
                'Name of the task 3',
                'Name of the task 4',
                'Name of the task 5',
            ])
            body.tasks
                .map((task) => task.statusId)
                .forEach((statusId) => {
                    expect(body.statuses.map((status) => status.id)).toContain(
                        statusId,
                    )
                })
            return
        })
    })

    describe('Delete /boards', () => {
        test('Delete a board, boardTasks and attachments', async () => {
            const { body: board } = await createBoard()

            const res = await deleteBoard(board.id)

            expect(res.status).toEqual(HttpStatus.OK)

            expect(board.id).toBeNumber()

            const deletedBoard = await findBoard(board.id)

            expect(deletedBoard).toBeNull()
        })
    })

    describe('PATCH /boards', () => {
        test('Updating a board title', async () => {
            const { body: board } = await createBoard()

            const updateDto: UpdateBoardDto = {
                title: 'UPDATED TITLE 1',
            }

            const updatedBoard = await updateBoard(board.id, updateDto)

            expect(updatedBoard.id).toBe(board.id)
            expect(updatedBoard.title).toEqual(updateDto.title)
        })
    })
})
