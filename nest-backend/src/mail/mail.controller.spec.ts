import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { MailController } from './mail.controller'
import { MailService } from './mail.service'

describe('MailController', () => {
    let controller: MailController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MailController],
            providers: [
                {
                    provide: MailService,
                    useValue: createMock<MailService>(),
                },
            ],
        }).compile()

        controller = module.get<MailController>(MailController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
