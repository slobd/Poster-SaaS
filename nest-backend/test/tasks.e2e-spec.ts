import { AppModule } from '@/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import {
    requestFactory,
    RequestUtil,
    Response,
    TestBoard,
    TestProject,
    TestWorkspace,
    TestTenant,
} from './utils/request-factory.util'
import { setupTest } from './utils/setup-test'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateTaskDto } from '@/task/dto/create-task.dto'
import { HttpStatus } from '@nestjs/common'
import { Task } from '@/task/entities/task.entity'
import { UpdateTaskDto } from '@/task/dto/update-task.dto'
import { AwsS3Service } from '@/aws/aws-s3.service'
import { User } from '@prisma/client'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'

describe('Tasks Module', () => {
    // Test context
    let app: NestExpressApplication
    let request: RequestUtil
    let server: any

    // Services
    let prisma: PrismaService
    let workspaceUsersService: WorkspacesUsersService

    // Test Data

    let tenant: TestTenant
    let workspace: TestWorkspace
    let board: TestBoard
    let project: TestProject
    let defaultData: CreateTaskDto
    let users: User[] = []

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = await setupTest(moduleFixture)

        await app.init()

        server = app.getHttpServer()

        request = await requestFactory(app, moduleFixture)

        prisma = app.get(PrismaService)
        workspaceUsersService = app.get(WorkspacesUsersService)

        workspace = request.getWorkspace()
        project = request.getProject()
        board = request.getBoard()
        tenant = request.getTenant()

        defaultData = {
            title: 'New Task',
            description: 'I am a description',
            statusId: board.statuses[0].id,
            board: {
                ...board,
                tenantId: tenant.id,
                project,
            },
        }
    })

    afterEach(async () => {
        for (const user of users) {
            await deleteUser(user.id)
        }
        users = []
    })

    afterAll(async () => {
        await prisma.task.deleteMany({
            where: { boardId: board.id },
        })

        await app.close()
        await server.close()
    })

    async function createTask(
        customData: Partial<CreateTaskDto> = {},
    ): Promise<Response<Task>> {
        const res = await request(
            {
                method: 'post',
                url: '/tasks',
                data: {
                    ...defaultData,
                    ...customData,
                },
            },
            server,
        )

        expect(res.status).toEqual(HttpStatus.CREATED)

        return res
    }

    async function updateTask(
        id: number,
        customData: Partial<UpdateTaskDto> = {},
    ): Promise<Task> {
        const res = await request(
            {
                method: 'patch',
                url: `/tasks/${id}`,
                data: {
                    ...defaultData,
                    ...customData,
                },
            },
            server,
        )

        expect(res.status).toEqual(HttpStatus.OK)

        return await findTask(id)
    }

    async function deleteTask(id: number): Promise<Response<void>> {
        return request(
            {
                method: 'delete',
                url: `/tasks/${id}`,
            },
            server,
        )
    }

    async function createAttachmentForTask(
        id: number,
    ): Promise<Response<Task>> {
        return request(
            {
                method: 'patch',
                url: `/tasks/${id}/uploads`,
                files: {
                    attachment: 'test/assets/random-poster.pdf',
                },
            },
            server,
        )
    }

    async function findTask(id: number): Promise<Task> {
        return prisma.task.findUnique({
            where: { id: id },
            include: {
                attachments: true,
                status: true,
                assignees: true,
            },
        })
    }

    async function createUser(
        partial: Partial<Omit<User, 'email'>> & { email: string },
    ): Promise<User> {
        const user = await prisma.user.create({
            data: {
                firstName: 'Max',
                lastName: 'Mustermann',
                email: 'max.mustermann.1@email.com',
                termOfUse: true,
                privacyPolicy: true,
                objectId: '1',
                ...partial,
            },
        })

        users.push(user)

        return user
    }

    async function createWorkspaceUser(
        partial: Partial<Omit<User, 'email'>> & { email: string },
    ): Promise<User> {
        const user = await createUser(partial)

        await workspaceUsersService.addUserToWorkspace(user.id, workspace)

        return user
    }

    async function deleteUser(id: number) {
        return prisma.user.delete({
            where: { id },
        })
    }

    describe('POST /tasks', () => {
        test('Create a task', async () => {
            const task = {
                title: 'title',
                description: 'description',
            }
            const { body } = await createTask(task)

            expect(body).toBeDefined()
            expect(typeof body.id).toBe('number')
            expect(body.id).toBeNumber()
            expect(body.title).toBe(task.title)
            expect(body.description).toBe(task.description)
            expect(body.status.id).toBe(defaultData.statusId)
            // Status belong to the board
            expect(
                board.statuses.map((s) => s.id).includes(body.status.id),
            ).toBeTrue()

            return
        })
    })

    describe('PATCH /tasks/:id', () => {
        test('Updating a task', async () => {
            const createRes = await createTask()

            const updateDto: UpdateTaskDto = {
                title: 'UPDATED TITLE',
                description: 'UPDATED DESCRIPTION',
                statusId: board.statuses[1].id,
                positionByStatus: 4000,
            }

            const updatedTask = await updateTask(createRes.body.id, updateDto)

            expect(updatedTask.id).toBe(createRes.body.id)
            expect(updatedTask.title).toEqual(updateDto.title)
            expect(updatedTask.description).toEqual(updateDto.description)
            expect(updatedTask.status.id).toEqual(updateDto.statusId)
            // Needs to be transformed into a string because the backend uses decimal.js
            expect(updatedTask.positionByStatus.toNumber()).toEqual(
                updateDto.positionByStatus,
            )
        })

        test('Update due date', async () => {
            const createTaskRes = await createTask()

            const taskId = createTaskRes.body.id

            const newDate = new Date()

            let updateDto: UpdateTaskDto
            let updatedTask: Task

            updateDto = {
                dueDate: newDate,
            }

            updatedTask = await updateTask(taskId, updateDto)

            expect(updatedTask.dueDate).toEqual(newDate)

            updateDto = {
                dueDate: null,
            }

            updatedTask = await updateTask(taskId, updateDto)

            expect(updatedTask.dueDate).toBe(null)
        })

        describe('Update Assignees', () => {
            async function createTaskWithAssignees(
                assignees: User[],
            ): Promise<Task> {
                const createdTaskRes = await createTask()
                
                const taskId = createdTaskRes.body.id

                return updateTask(taskId, {
                    assignees,
                })
            }

            async function createAssignees(): Promise<[User, User, User]> {
                const user1 = await createWorkspaceUser({
                    email: 'test.user.1@email.com',
                })
                const user2 = await createWorkspaceUser({
                    email: 'test.user.2@email.com',
                })
                const user3 = await createWorkspaceUser({
                    email: 'test.user.3@email.com',
                })

                return [user1, user2, user3]
            }

            test('Add assignees', async () => {
                const assignees = await createAssignees()

                const task = await createTaskWithAssignees(assignees)

                expect(task.assignees.map((a) => a.id)).toIncludeAllMembers(
                    assignees.map((a) => a.id),
                )
            })

            test('Remove one assignee', async () => {
                const assignees = await createAssignees()

                const task = await createTaskWithAssignees(assignees)

                const secondAssignee = assignees[1]

                const updatedTask = await updateTask(task.id, {
                    assignees: [assignees[0], assignees[2]],
                })

                expect(
                    updatedTask.assignees.map((a) => a.id),
                ).not.toIncludeAnyMembers([secondAssignee])
            })

            test('Remove all assignees', async () => {
                const assignees = await createAssignees()

                const task = await createTaskWithAssignees(assignees)

                const updatedTask = await updateTask(task.id, {
                    assignees: [],
                })

                expect(updatedTask.assignees).toHaveLength(0)
            })
        })
    })

    describe('DELETE /tasks/:id', () => {
        test('Deleting a task', async () => {
            const { body: task } = await createTask()

            const res = await deleteTask(task.id)

            expect(res.status).toEqual(HttpStatus.NO_CONTENT)

            expect(task.id).toBeNumber()

            const deletedTask = await findTask(task.id)

            expect(deletedTask).toBeNull()

            return
        })
    })

    describe('PATCH /tasks/:id/uploads', () => {
        test('Adding an attachment to a Task', async () => {
            const { body: task } = await createTask()

            const res = await createAttachmentForTask(task.id)

            expect(res.body.attachments.length).toBe(1)
        })
    })

    describe('DELETE /tasks/:id/uploads/:uploadId', () => {
        test('Deleting an attachment from a Task', async () => {
            const { body: task } = await createTask()

            const createUploadRes = await createAttachmentForTask(task.id)

            expect(createUploadRes.body.attachments.length).toBe(1)

            const file = createUploadRes.body.attachments[0]

            const deleteUploadRes = await request(
                {
                    method: 'delete',
                    url: `/tasks/${task.id}/uploads/${file.id}`,
                },
                server,
            )

            expect(deleteUploadRes.status).toBe(HttpStatus.NO_CONTENT)

            const taskWithoutAttachments = await findTask(task.id)

            expect(taskWithoutAttachments.attachments.length).toBe(0)

            // https://posterlab-development.s3.eu-central-1.amazonaws.com/1652168214993.pdf

            const awsS3Service = app.get(AwsS3Service)

            await expect(
                awsS3Service.getObject({
                    Bucket: file.bucket,
                    Key: file.key,
                }),
            ).rejects.toContainEntries([
                ['code', 'NoSuchKey'],
                ['message', 'The specified key does not exist.'],
            ])
        })
    })
})
