import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { UploadsController } from '../uploads.controller'
import { UploadsService } from '../uploads.service'

describe('Uploads Controller', () => {
    let controller: UploadsController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UploadsController],
            providers: [
                {
                    provide: UploadsService,
                    useValue: createMock<UploadsService>(),
                },
            ],
        }).compile()

        controller = module.get<UploadsController>(UploadsController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
