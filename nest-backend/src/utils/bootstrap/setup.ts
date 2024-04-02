import { NestExpressApplication } from '@nestjs/platform-express'
import { PrismaService } from '@/prisma/prisma.service'
import { ValidationPipe } from '@nestjs/common'
import { validationPipeOption } from '@/utils/validation/validation-pipe.config'
import { json, urlencoded } from 'body-parser'
import { useContainer } from 'class-validator'
import { AppModule } from '@/app.module'
import { migrateDefaultIdentityProviders } from '@/utils/bootstrap/migrate-local-idp'
import { migrateDefaultRoles } from '@/utils/bootstrap/migrate-default-roles'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import * as fs from 'fs'
import { ConfigService } from '@nestjs/config'

export async function setupApp(app: NestExpressApplication): Promise<void> {
    const prismaService: PrismaService = app.get(PrismaService)

    // Prisma - Nest requirement
    await prismaService.enableShutdownHooks(app)

    // Cors
    app.enableCors()

    // Validation
    app.useGlobalPipes(new ValidationPipe(validationPipeOption))

    // Increase bodyLimit
    app.use(json({ limit: '5mb' }))

    app.use(urlencoded({ limit: '5mb', extended: true }))

    // Dependency Injection
    useContainer(app.select(AppModule), { fallbackOnErrors: true })
}

export async function runMigrations(
    app: NestExpressApplication,
): Promise<void> {
    const issuer = app.get(ConfigService).get('LOCAL_ACCOUNT_ISSUER')

    await migrateDefaultIdentityProviders(app, issuer)

    await migrateDefaultRoles(app)
}

export async function setupDocumentation(
    app: NestExpressApplication,
): Promise<void> {
    const document = createOpenApiDocument(app)

    SwaggerModule.setup('api', app, document)

    await createOpenApiSpec(document)
}

function createOpenApiDocument(app) {
    const options = new DocumentBuilder()
        .setTitle('Posters example')
        .setDescription('The posters API description')
        .setVersion('1.0')
        .addTag('posters')
        .build()

    return SwaggerModule.createDocument(app, options)
}

async function createOpenApiSpec(document: OpenAPIObject) {
    const prettier = await import('prettier')

    const documentJson = JSON.stringify(document)
    const openApiSpecPath = 'openApiSpec.json'

    const openApiSpecContent = prettier.format(documentJson, {
        filepath: openApiSpecPath,
        tabWidth: 4,
        endOfLine: 'lf',
    })
    fs.writeFileSync(openApiSpecPath, openApiSpecContent)
}
