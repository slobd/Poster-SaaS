import { INestApplicationContext } from '@nestjs/common'
import {
    Prisma,
    ProjectVisibilityEnum,
    Role,
    Tenant,
    User,
    Workspace,
} from '@prisma/client'
import { TenantPostHandler } from '@/tenant/handlers/tenant-post.handler'
import { UsersService } from '@/iam/users/users.service'
import { PrismaService } from '@/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { fetchDemoPeopleProjectData } from '@/utils/bootstrap/read-excel-file'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'
import { uploadDemoPosters } from '@/utils/bootstrap/upload-demo-posters'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { RoleDomain } from '@/access-control/rules/rules.constants'
import { TenantRoleEnum } from '@/access-control/roles/default-roles.service'

export async function seedDemoTenant(
    app: INestApplicationContext,
): Promise<void> {
    const tenantPostHandler = await app.resolve(TenantPostHandler)
    const usersService = app.get(UsersService)
    const usersRolesService = app.get(UsersRolesService)

    const prisma = app.get(PrismaService)
    const configService = app.get(ConfigService)
    const workspaceUsersService = app.get(WorkspacesUsersService)

    try {
        const host = configService.get('DEMO_TENANT_HOST') || 'localhost:3002'
        const email = configService.get('SEED_TENANT_OWNER_EMAIL')

        // Check if demo tenant already exist
        if (await tenantAvailabilityCheck(host)) return
        let user: User = await prisma.user.findUnique({
            where: { email },
        })
        if (!user) {
            user = await createUser({
                email: email,
                firstName: 'Adrian',
                lastName: 'Wix',
            })
        }

        const tenant = await createTenant(user, host)
        const demoPeopleProject = fetchDemoPeopleProjectData()

        const workspace = await fetchTenantWorkspace(tenant.id)

        const members = await createMemberUsers(demoPeopleProject.people)
        console.log('addding workspacess')
        await assignRoleAndWorkspace(members, workspace)

        await uploadDemoPosters(
            app,
            members,
            workspace.id,
            demoPeopleProject.gallery,
        )

        await createDemoProjects(
            workspace.id,
            user.id,
            demoPeopleProject.project,
        )

        console.log('Seeding Demo Data Done')
    } catch (e) {
        console.error(e)
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
        ) {
            console.log(`Seed failed because of duplicated unique key error`)
        }
    }

    async function tenantAvailabilityCheck(host): Promise<Tenant> {
        return prisma.tenant.findUnique({
            where: {
                host: host,
            },
        })
    }

    async function createUser<WasValidated>(userInfo: {
        email: string
        firstName: string
        lastName: string
    }) {
        let user: User = await prisma.user.findUnique({
            where: {
                email: userInfo.email,
            },
        })
        if (!user) {
            console.log('SEEDING USER...')
            user = await usersService.create({
                email: userInfo.email,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                password: 'Gutenberg2020',
                termOfUse: true,
                privacyPolicy: true,
                subscribed: false,
            })
        } else {
            console.log(
                `User with email ${userInfo.email} was already in the DB`,
            )
        }
        return user
    }

    async function createTenant<WasValidated>(
        user: User,
        host: WasValidated extends true ? Exclude<any, undefined> : any,
    ) {
        let tenant = await prisma.tenant.findUnique({
            where: {
                host,
            },
        })
        if (!tenant) {
            tenant = await tenantPostHandler.handle(
                {
                    name: 'Demo Tenant',
                    host,
                    domain: null,
                },
                user as SanitizedUserDto,
            )

            console.log('Seeded tenant', tenant)
        } else {
            console.log(`Tenant with host ${host} was already in the DB`)
        }
        return tenant
    }

    async function createMemberUsers(members: Partial<User>[]) {
        const memberList = []
        for (const user of members) {
            const member = await createUser({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            })
            memberList.push({
                id: member.id,
                email: member.email,
                firstName: member.firstName,
                lastName: member.lastName,
            })
        }
        return memberList
    }

    async function fetchTenantWorkspace(tenantId: number): Promise<Workspace> {
        const workspaces = await prisma.workspace.findMany({
            where: {
                tenantId: tenantId,
            },
        })

        if (workspaces.length === 0) return
        else return workspaces[0]
    }

    async function createDemoProjects(
        workspaceId: number,
        ownerId: number,
        projectList: any[],
    ) {
        for (const project of projectList) {
            await prisma.project.create({
                data: {
                    name: project.name,
                    workspace: {
                        connect: {
                            id: workspaceId,
                        },
                    },
                    owner: {
                        connect: {
                            id: ownerId,
                        },
                    },
                    visibility: ProjectVisibilityEnum.PUBLIC,
                    informationTabs: {
                        create: {
                            description: project.summary,
                            topics: {
                                connectOrCreate: project.topics.map((item) => ({
                                    where: {
                                        name_workspaceId: {
                                            name: item,
                                            workspaceId: workspaceId,
                                        },
                                    },
                                    create: {
                                        name: item,
                                        workspace: {
                                            connect: {
                                                id: workspaceId,
                                            },
                                        },
                                    },
                                })),
                            },
                            keywords: {
                                connectOrCreate: project.keywords.map(
                                    (item) => ({
                                        where: {
                                            name_workspaceId: {
                                                name: item,
                                                workspaceId: workspaceId,
                                            },
                                        },
                                        create: {
                                            name: item,
                                            workspace: {
                                                connect: {
                                                    id: workspaceId,
                                                },
                                            },
                                        },
                                    }),
                                ),
                            },
                        },
                    },
                    boards: {
                        create: {
                            statuses: {
                                createMany: {
                                    data: [
                                        { name: 'TO DO' },
                                        { name: 'IN PROGRESS' },
                                        { name: 'REVIEW' },
                                        { name: 'DONE' },
                                    ],
                                },
                            },
                        },
                    },
                },
            })
        }
    }
    async function assignRoleAndWorkspace(members: any[], workspace) {
        console.log(
            'adding users to tenant and workspace: ',
            workspace.tenantId,
            workspace.id,
        )
        for (const user of members) {
            const tenantRole = await findTenantMemberRole(workspace.tenantId)
            await usersRolesService.giveRoleToUser(user.id, tenantRole.id)
            await workspaceUsersService.addUserToWorkspace(user.id, workspace)
        }
    }

    async function findTenantMemberRole(tenantId: number): Promise<Role> {
        return prisma.role.findFirst({
            where: {
                domain: RoleDomain.Tenant(tenantId),
                name: TenantRoleEnum.MEMBER,
            },
        })
    }
}
