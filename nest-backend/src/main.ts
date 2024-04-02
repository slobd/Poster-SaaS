import 'module-alias/register'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { seed } from '@/utils/bootstrap/seed'
import { ConfigService } from '@nestjs/config'
import {
    runMigrations,
    setupApp,
    setupDocumentation,
} from '@/utils/bootstrap/setup'
import { seedDemoTenant } from '@/utils/bootstrap/demo-env-seed'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    const config = app.get(ConfigService)

    await setupApp(app)

    await runMigrations(app)

    if (config.get('SEED') === 'true') await seed(app)

    if (process.env.NODE_ENV === 'development') await setupDocumentation(app)

    if (process.env.DEMO_TENANT_SEED === 'true') await seedDemoTenant(app)

    await app.listen(process.env.PORT || 2828)
}

bootstrap()
