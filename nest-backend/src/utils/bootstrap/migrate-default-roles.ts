import { INestApplicationContext } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DefaultRolesService } from '@/access-control/roles/default-roles.service'
import { RolesService } from '@/access-control/roles/roles.service'
import { Prisma } from '@prisma/client'
import { CreateRoleDto } from '@/access-control/entities/role.entity'

export async function migrateDefaultRoles(
    app: INestApplicationContext,
): Promise<void> {
    const prisma = app.get(PrismaService)
    const defaultRolesService = app.get(DefaultRolesService)
    const rolesService = app.get(RolesService)

    const tenants = await prisma.tenant.findMany({
        include: {
            roles: {
                where: {
                    system: true,
                },
            },
            workspaces: true,
        },
    })

    type Tenant = typeof tenants[number]

    const lastMigration = await prisma.roleMigrations.findMany({
        orderBy: [
            {
                createdAt: 'desc',
            },
        ],
        take: 1,
    })

    const tenantRolesTemplate = defaultRolesService.getTenantRolesTemplate(
        {},
    ) as unknown as Prisma.InputJsonArray

    const workspaceRolesTemplate =
        defaultRolesService.getWorkspaceRolesTemplate(
            {},
        ) as unknown as Prisma.InputJsonArray

    // console.log(util.inspect(tenantRolesTemplate))
    // console.log(util.inspect(workspaceRolesTemplate))

    const isFirstMigration = lastMigration.length === 0
    const wasAnyDefaultRoleChange =
        !areTenantRolesEqual() || !areWorkspaceRolesEqual()

    if (isFirstMigration || wasAnyDefaultRoleChange) {
        // console.log(
        //     isFirstMigration ? 'RUNNING FIRST MIGRATION' : 'MIGRATING ROLES...',
        // )

        await runMigration(tenants)

        await saveRoleMigration()
    }

    function areTenantRolesEqual(): boolean {
        const areRolesEqual =
            JSON.stringify((lastMigration[0]?.roles as any)?.tenant) ===
            JSON.stringify(tenantRolesTemplate)

        // console.log('Are Tenant roles equal:', areRolesEqual)

        return areRolesEqual
    }

    function areWorkspaceRolesEqual(): boolean {
        const areRolesEqual =
            JSON.stringify((lastMigration[0]?.roles as any)?.workspace) ===
            JSON.stringify(workspaceRolesTemplate)

        // console.log('Are Workspace roles equal:', areRolesEqual)

        return areRolesEqual
    }

    async function runMigration(tenants: Tenant[]) {
        for (const tenant of tenants) {
            if (tenant.roles.length === 0) continue

            const oldRolesTable = getOldRolesTable(tenant)

            if (!areTenantRolesEqual()) {
                await updateTenantRoles(tenant, oldRolesTable)
            }

            if (!areWorkspaceRolesEqual()) {
                await updateWorkspacesRoles(tenant, oldRolesTable)
            }
        }
    }

    /**
     * This table allows you to access the old roles by name in order to get their ID
     * @param tenant
     */
    function getOldRolesTable(tenant) {
        return tenant.roles.reduce((prev, curr) => {
            return {
                ...prev,
                [curr.name + curr.domain]: curr,
            }
        }, {})
    }

    async function updateTenantRoles(tenant, oldRolesTable) {
        const newRoles = defaultRolesService.getTenantRoles(tenant as Tenant)
        await updateRoles(newRoles, oldRolesTable)
    }

    async function updateWorkspacesRoles(tenant: Tenant, oldRolesTable) {
        for (const workspace of tenant.workspaces) {
            const newRoles = defaultRolesService.getWorkspaceRoles({
                ...workspace,
                tenant,
            })
            await updateRoles(newRoles, oldRolesTable)
        }
    }

    async function updateRoles(
        newRoles: (CreateRoleDto & { system: boolean })[],
        oldRolesTable,
    ) {
        for (const newRole of newRoles) {
            await rolesService.updateRole({
                id: oldRolesTable[newRole.name + newRole.domain].id,
                ...newRole,
            })
        }
    }

    async function saveRoleMigration() {
        await prisma.roleMigrations.create({
            data: {
                roles: {
                    tenant: tenantRolesTemplate,
                    workspace: workspaceRolesTemplate,
                },
            },
        })
    }
}
