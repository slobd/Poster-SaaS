import { AwsS3Service } from '@/aws/aws-s3.service'
import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Upload } from '../upload.entity'
import { UploadsService } from '../uploads.service'

describe('UploadsService', () => {
    let service: UploadsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadsService,
                {
                    provide: getRepositoryToken(Upload),
                    useValue: createMock<Repository<Upload>>(),
                },
                {
                    provide: AwsS3Service,
                    useValue: createMock<AwsS3Service>(),
                },
                {
                    provide: ConfigService,
                    useValue: createMock<ConfigService>(),
                },
            ],
        }).compile()

        service = module.get<UploadsService>(UploadsService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
