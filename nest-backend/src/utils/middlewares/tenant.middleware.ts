import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import { TenantRepository } from '@/tenant/tenant.repository'

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name)

    constructor(private readonly tenantRepository: TenantRepository) {}

    async use(
        req: Request,
        res: Response,
        next: () => void,
    ): Promise<void | Response<any>> {
        const xTenant = req.headers['x-tenant'] as string
        if (xTenant && !isNaN(xTenant as unknown as number)) {
            try {
                const tenant = await this.tenantRepository.findOneById(
                    parseInt(xTenant),
                )

                if (!tenant) {
                    return res
                        .status(HttpStatus.NOT_FOUND)
                        .send('Tenant not found')
                }
                if (process.env.NODE_ENV !== 'test') {
                    this.logger.debug(tenant.name)
                }

                req.tenant = tenant
                next()
            } catch (error) {
                // TODO: Renew token
                this.logger.error(null, error)
                return res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .send('Internal Server Error')
            }
        } else {
            // TODO Change to a more appropiate res
            return res.status(HttpStatus.BAD_REQUEST).send('Missing x-tenant')
        }
    }
}
