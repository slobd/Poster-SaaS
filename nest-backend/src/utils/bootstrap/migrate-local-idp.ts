import { INestApplicationContext } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma } from '@prisma/client'

export async function migrateDefaultIdentityProviders(
    app: INestApplicationContext,
    issuer: string,
): Promise<void> {
    const prisma = app.get(PrismaService)
    const identityProviders = await prisma.identityProvider.findUnique({
        where: {
            name: 'local',
        },
    })
    if (!identityProviders) {
        const input = {
            name: 'local',
            domain: `${issuer}.onmicrosoft.com`,
            userDirectory: undefined,
            userAccount: undefined,
        } as Prisma.IdentityProviderCreateInput

        await prisma.identityProvider.create({
            data: input,
        })
    }
}
