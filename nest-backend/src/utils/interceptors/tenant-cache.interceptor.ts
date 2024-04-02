import {
    Injectable,
    CacheInterceptor,
    ExecutionContext,
    Optional,
    Inject,
    HttpAdapterHost,
} from '@nestjs/common'
import { CACHE_KEY_METADATA } from '@nestjs/common/cache/cache.constants'
import { Request } from 'express'

const HTTP_ADAPTER_HOST = 'HttpAdapterHost'

@Injectable()
export class TenantCacheInterceptor extends CacheInterceptor {
    @Optional()
    @Inject(HTTP_ADAPTER_HOST)
    protected readonly httpAdapterHost: HttpAdapterHost

    trackBy(context: ExecutionContext): string | undefined {
        const httpAdapter = this.httpAdapterHost.httpAdapter
        const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod
        const cacheMetadata = this.reflector.get(
            CACHE_KEY_METADATA,
            context.getHandler(),
        )

        if (!isHttpApp || cacheMetadata) {
            return cacheMetadata
        }

        const request = context.getArgByIndex<Request>(0)
        if (
            httpAdapter.getRequestMethod(request) !== 'GET' ||
            !request.tenant
        ) {
            return undefined
        }
        const url = httpAdapter.getRequestUrl(request)
        console.log(`tenant:${request.tenant.id}_url:${url}`)
        return `tenant:${request.tenant.id}_url:${url}`
    }
}
