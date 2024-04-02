import { Module } from '@nestjs/common'
import { AwsS3Service } from './aws-s3.service'
import * as S3 from 'aws-sdk/clients/s3'
import { AWS_S3 } from './constants'

@Module({
    providers: [
        AwsS3Service,
        {
            provide: AWS_S3,
            useValue: new S3({
                region: 'eu-central-1',
            }),
        },
    ],
    controllers: [],
    exports: [AwsS3Service],
})
export class AwsModule {}
