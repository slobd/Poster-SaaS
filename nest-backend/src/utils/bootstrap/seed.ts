import { INestApplicationContext } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { TenantPostHandler } from '@/tenant/handlers/tenant-post.handler'
import { UsersService } from '@/iam/users/users.service'
import { PrismaService } from '@/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'

export async function seed(app: INestApplicationContext): Promise<void> {
    try {
        const tenantPostHandler = await app.resolve(TenantPostHandler)
        const usersService = app.get(UsersService)
        const prisma = app.get(PrismaService)
        const configService = app.get(ConfigService)

        const host = configService.get('SEED_TENANT_HOST') || 'localhost:3001'
        const email = configService.get('SEED_TENANT_OWNER_EMAIL')

        let user: User = await prisma.user.findUnique({
            where: { email },
        })
        if (!user) {
            // console.log('SEEDING USER...')
            user = await usersService.create({
                email: email,
                firstName: 'Max',
                lastName: 'Mustermann',
                password: 'Gutenberg2020',
                termOfUse: true,
                privacyPolicy: true,
                subscribed: false,
            })
        } else {
            // console.log(`User with email ${email} was already in the DB`)
        }

        let tenant = await prisma.tenant.findUnique({
            where: {
                host,
            },
        })
        if (!tenant) {
            tenant = await tenantPostHandler.handle(
                {
                    name: 'Tenant 1',
                    host,
                    domain: 'posterlab.co,pl-dev.de',
                },
                user as SanitizedUserDto,
            )

            // console.log('Seeded tenant', tenant)
        } else {
            // console.log(`Tenant with host ${host} was already in the DB`)
        }
    } catch (e) {
        console.error(e)
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
        ) {
            console.log(`Seed failed because of duplicated unique key error`)
        }
    }
}
