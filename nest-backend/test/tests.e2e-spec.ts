import { AppModule } from '@/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import { requestFactory, RequestUtil } from './utils/request-factory.util'
import { setupTest } from './utils/setup-test'

describe('/tests', () => {
    let app: NestExpressApplication
    let request: RequestUtil
    let server: any

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = await setupTest(moduleFixture)

        await app.init()

        server = app.getHttpServer()

        request = await requestFactory(app, moduleFixture)
    })

    afterAll(async () => {
        await app.close()
        await server.close()
    })

    // afterEach(async () => {
    // })

    describe('GET /tests ', () => {
        test('Setup is working', async () => {
            const res = await request(
                {
                    method: 'get',
                    url: '/tests',
                },
                server,
            )

            expect(res.text).toBe('This action returns all tests')
        })
    })

    describe('POST /tests ', () => {
        test('Setup is working', async () => {
            const res = await request(
                {
                    method: 'post',
                    url: '/tests',
                },
                server,
            )

            expect(res.text).toBe('This action adds a new test')
        })
    })
})
