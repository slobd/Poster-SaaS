import { AWS_S3 } from './constants'
import { Inject, Injectable } from '@nestjs/common'
import * as S3 from 'aws-sdk/clients/s3'

/**
 * TODO: Uncomment console.logs when proper logger is implemented and use "debug" level
 */
@Injectable()
export class AwsS3Service {
    constructor(@Inject(AWS_S3) private readonly awsS3: S3) {}

    listBuckets(): Promise<S3.ListBucketsOutput | void> {
        return new Promise((resolve, reject) => {
            this.awsS3.listBuckets(function (err, data) {
                if (err) {
                    // console.log(err, err.stack)
                    // console.log('error')
                    reject(err)
                }
                // an error occurred
                else {
                    // console.log(data)
                    // console.log('Successful listBuckets')
                    resolve(data)
                } // successful response
            })
        })
    }

    listObjects(params: S3.ListObjectsRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            this.awsS3.listObjects(params, function (err, data) {
                if (err) {
                    // console.log(err, err.stack)
                    // console.log('error')
                    reject(err)
                }
                // an error occurred
                else {
                    // console.log(data)
                    // console.log('Successful listObjects')
                    resolve(data)
                } // successful response
            })
        })
    }

    getObject(params: S3.GetObjectRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            this.awsS3.getObject(params, function (err, data) {
                if (err) {
                    // console.log(err, err.stack)
                    // console.log('error')
                    reject(err)
                }
                // an error occurred
                else {
                    // console.log(data)
                    // console.log('Successful getObject')
                    resolve(data)
                } // successful response
            })
        })
    }

    upload(
        params: S3.PutObjectRequest,
    ): Promise<S3.ManagedUpload.SendData | void> {
        const newParams = {
            ...params,
            Key: Date.now().toString() + params.Key,
        }
        return new Promise((resolve, reject) => {
            this.awsS3.upload(newParams, function (err, data) {
                if (err) {
                    // console.log(err, err.stack)
                    // console.log('error')
                    reject(err)
                }
                // an error occurred
                else {
                    // console.log('Successful file Upload key: ', data.Key)
                    resolve(data)
                } // successful response
            })
        })
    }

    deleteObject(
        params: S3.DeleteObjectRequest,
    ): Promise<S3.DeleteObjectOutput | void> {
        return new Promise((resolve, reject) => {
            this.awsS3.deleteObject(params, function (err, data) {
                if (err) {
                    // console.log(err, err.stack)
                    // console.log('error')
                    reject(err)
                }
                // an error occurred
                else {
                    // console.log(data)
                    // console.log('Successful deleteObject')
                    resolve(data)
                } // successful response
            })
        })
    }
}
