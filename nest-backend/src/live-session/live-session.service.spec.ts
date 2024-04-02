import { Test, TestingModule } from '@nestjs/testing'
import { LiveSessionService } from './live-session.service'

describe('LiveSessionService', () => {
    let service: LiveSessionService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LiveSessionService],
        }).compile()

        service = module.get<LiveSessionService>(LiveSessionService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
