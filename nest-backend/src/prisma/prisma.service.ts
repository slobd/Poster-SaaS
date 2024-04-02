import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({ log: ['error'] })
    }

    async onModuleInit(): Promise<void> {
        await this.$connect()
    }

    async enableShutdownHooks(app: INestApplication): Promise<void> {
        this.$on('beforeExit', async () => {
            await app.close()
            console.log('enableShutdownHooks - beforeExit')
        })
    }
}
