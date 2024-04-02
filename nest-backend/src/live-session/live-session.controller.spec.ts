import { Test, TestingModule } from '@nestjs/testing'
import { LiveSessionController } from './live-session.controller'
import { LiveSessionService } from './live-session.service'

describe('LiveSessionController', () => {
    let controller: LiveSessionController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LiveSessionController],
            providers: [LiveSessionService],
        }).compile()

        controller = module.get<LiveSessionController>(LiveSessionController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
