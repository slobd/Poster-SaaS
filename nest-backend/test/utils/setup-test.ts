import { runMigrations, setupApp } from '@/utils/bootstrap/setup'
import { seed } from '@/utils/bootstrap/seed'
import { TestingModule } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'

export async function setupTest(
    moduleFixture: TestingModule,
): Promise<NestExpressApplication> {
    const app: NestExpressApplication = moduleFixture.createNestApplication()

    await setupApp(app)

    await runMigrations(app)

    await seed(app)

    return app
}
