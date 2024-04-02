import { AppModule } from '@/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import {
    requestFactory,
    RequestUtil,
    TestWorkspace,
} from './utils/request-factory.util'
import { setupTest } from './utils/setup-test'
import { Poster, PosterVisibilityEnum, User } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'
import { HttpStatus } from '@nestjs/common'

describe('Workspace Module (People)', () => {
    let app: NestExpressApplication
    let request: RequestUtil
    let server: any

    // Services
    let prisma: PrismaService
    let workspaceUsersService: WorkspacesUsersService

    let workspace: TestWorkspace

    let users: User[] = []
    let posters: Poster[] = []

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
    })

    afterAll(async () => {
        await app.close()
        await server.close()
    })

    afterEach(async () => {
        for (const poster of posters) {
            await deletePoster(poster.id)
        }
        posters = []

        for (const user of users) {
            await deleteUser(user.id)
        }
        users = []
    })

    async function createUserPoster(
        partial: Partial<Poster>,
        userData: User,
    ): Promise<Poster> {
        const poster = await prisma.poster.create({
            data: {
                visibility: PosterVisibilityEnum.PUBLIC,
                userId: userData.id,
                title: 'Poster Sampe',
                description: 'Poster Sample description',
                workspaceId: workspace.id,
                ...partial,
            },
        })

        posters.push(poster)
        return poster
    }

    async function assignUserAsCoAuthorToPoster(
        poster: Poster,
        userData: User,
    ): Promise<void> {
        await prisma.poster.update({
            where: {
                id: poster.id,
            },
            data: {
                authors: {
                    connect: {
                        id: userData.id,
                    },
                },
            },
        })
    }

    async function createWorkspaceUser(
        partial: Partial<Omit<User, 'email'>> & { email: string },
    ): Promise<User> {
        const user = await createUser(partial)
        await workspaceUsersService.addUserToWorkspace(user.id, workspace)
        return user
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

    async function deleteUser(id: number) {
        return prisma.user.delete({
            where: { id },
        })
    }

    async function deletePoster(id: number) {
        return prisma.poster.delete({
            where: { id },
        })
    }

    describe('GET /workspaces/:id/people/:userId', () => {
        test('Get workspace users', async () => {
            const user = await createWorkspaceUser({
                email: 'test.user.6@email.com',
            })

            const res = await request(
                {
                    method: 'get',
                    url: `/workspaces/${workspace.id}/people/${user.id}`,
                },
                server,
            )

            expect(res.status).toBe(HttpStatus.OK)
            expect(res.body.id).toBe(user.id)
            expect(res.body.workspaceId).toBe(workspace.id)
        })

        test('Get workspace users poster', async () => {
            const user = await createWorkspaceUser({
                email: 'test.user.5@email.com',
            })

            const poster = await createUserPoster(
                {
                    title: 'Poster 1',
                },
                user,
            )

            const res = await request(
                {
                    method: 'get',
                    url: `/workspaces/${workspace.id}/people/${user.id}`,
                },
                server,
            )

            expect(res.status).toBe(HttpStatus.OK)
            expect(res.body.id).toBe(user.id)
            expect(res.body.workspaceId).toBe(workspace.id)
            expect(res.body.posters).toHaveLength(1)
            expect(res.body.posters[0].id).toBe(poster.id)
        })

        test('Get workspace users co authored poster', async () => {
            const authorUser = await createWorkspaceUser({
                email: 'author@posterlab.co',
            })

            const coAuthorUser = await createWorkspaceUser({
                email: 'coAuthor@posterlab.co',
            })

            const poster = await createUserPoster(
                {
                    title: 'Poster 1',
                },
                authorUser,
            )

            await assignUserAsCoAuthorToPoster(poster, coAuthorUser)

            const res = await request(
                {
                    method: 'get',
                    url: `/workspaces/${workspace.id}/people/${coAuthorUser.id}`,
                },
                server,
            )

            expect(res.status).toBe(HttpStatus.OK)
            expect(res.body.id).toBe(coAuthorUser.id)
            expect(res.body.workspaceId).toBe(workspace.id)
            expect(res.body.authoredPosters).toHaveLength(1)
            expect(res.body.authoredPosters[0].id).toBe(poster.id)
        })
    })
})
