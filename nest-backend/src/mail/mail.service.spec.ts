import { TenantService } from '@/tenant/tenant.service'
import { createMock } from '@golevelup/ts-jest'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MailService } from './mail.service'
import { HttpService } from '@nestjs/axios'

describe('MailService', () => {
    let service: MailService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: MailerService,
                    useValue: createMock<MailerService>(),
                },
                {
                    provide: TenantService,
                    useValue: createMock<TenantService>(),
                },
                {
                    provide: HttpService,
                    useValue: createMock<HttpService>(),
                },
                {
                    provide: ConfigService,
                    useValue: createMock<ConfigService>(),
                },
            ],
        }).compile()

        service = module.get<MailService>(MailService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
