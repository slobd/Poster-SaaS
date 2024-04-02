import { NotImplementedException } from '@nestjs/common'

export class LiveSessionRepository {
    async save(_param: any): Promise<any> {
        throw new NotImplementedException()
    }

    async findOne(_param: any): Promise<any> {
        throw new NotImplementedException()
    }

    async update(...args: any): Promise<any> {
        throw new NotImplementedException()
    }

    async find(...args: any): Promise<any> {
        throw new NotImplementedException()
    }
}
