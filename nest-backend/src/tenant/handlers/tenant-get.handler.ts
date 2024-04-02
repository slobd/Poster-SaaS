import { Injectable } from '@nestjs/common'
import { FindOneTenantDto } from '../dto/find-one-tenant.dto'
import {
    TenantRepository,
    TenantWithFeatures,
} from '@/tenant/tenant.repository'

@Injectable()
export class TenantGetHandler {
    constructor(private readonly tenantRepository: TenantRepository) {}

    async handle(query: FindOneTenantDto): Promise<TenantWithFeatures> {
        return await this.tenantRepository.findUnique(query)
    }
}
