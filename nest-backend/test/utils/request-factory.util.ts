import { Request } from 'superagent'
import { NestExpressApplication } from '@nestjs/platform-express'
import { TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@/prisma/prisma.service'
import * as request from 'supertest'
import { Prisma, User } from '@prisma/client'
import * as path from 'path'

export interface Response<T> extends request.Response {
    body: T
}

export const tenantArgs = Prisma.validator<Prisma.TenantArgs>()({
    include: {
        owner: true,
        workspaces: {
            include: {
                projects: {
                    include: {
                        boards: {
                            include: {
                                statuses: true,
                            },
                        },
                    },
                },
            },
        },
    },
})

export type TestTenant = Prisma.TenantGetPayload<typeof tenantArgs>
export type TestWorkspace = TestTenant['workspaces'][number]
export type TestProject = TestWorkspace['projects'][number]
export type TestBoard = TestProject['boards'][number]

interface RequestUtilArg {
    method: 'post' | 'patch' | 'get' | 'delete'
    url: string
    data?: any
    files?: any
    opts?: { files: boolean }
}

export interface RequestUtil {
    (arg: RequestUtilArg, server: any): Promise<Request>

    /**
     * Return the user making the request. Defaults to the owner of the tenant
     */
    getUser(): User

    /**
     * Return the default seeded tenant
     */
    getTenant(): TestTenant

    /**
     * Return the default seeded workspace
     */
    getWorkspace(): TestWorkspace

    /**
     * Return the default seeded project
     */
    getProject(): TestProject

    /**
     * Return the default seeded board
     */
    getBoard(): TestBoard
}

export async function requestFactory(
    app: NestExpressApplication,
    moduleFixture: TestingModule,
): Promise<RequestUtil> {
    const jwtService = moduleFixture.get(JwtService)
    const prisma = moduleFixture.get(PrismaService)

    const tenant = await prisma.tenant.findUnique({
        where: {
            host: process.env.SEED_TENANT_HOST,
        },
        ...tenantArgs,
    })

    const tenantOwner = tenant.owner

    const req = async function (arg: RequestUtilArg, server): Promise<Request> {
        const { method, url, data = {}, files } = arg

        const jwtToken = jwtService.sign({
            email: tenantOwner.email,
            sub: tenantOwner.id,
        })

        let r

        if (method === 'post') {
            r = request(server).post(url)
        } else if (method === 'get') {
            r = request(server).get(url)
        } else if (method === 'patch') {
            r = request(server).patch(url)
        } else if (method === 'delete') {
            r = request(server).delete(url)
        }

        r.auth(jwtToken, { type: 'bearer' }).set({
            'x-tenant': tenant.id,
        })

        if (!files) {
            return r.send(data)
        } else {
            for (const dataKey in data) {
                r.field(dataKey, data[dataKey])
            }
            for (const filesKey in files) {
                r.attach(filesKey, path.join(process.cwd(), files[filesKey]))
            }
            return r
        }
    }

    req.getUser = function () {
        return tenant.owner
    }

    req.getTenant = function () {
        return tenant
    }

    req.getWorkspace = function () {
        return tenant.workspaces[0]
    }

    req.getProject = function () {
        return tenant.workspaces[0].projects[0]
    }

    req.getBoard = function () {
        return tenant.workspaces[0].projects[0].boards[0]
    }

    return req
}
