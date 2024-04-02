import { CanActivate, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseClass } from '@/utils/shared/base-class'

@Injectable()
export class IsDevGuard extends BaseClass implements CanActivate {
    constructor(private readonly config: ConfigService) {
        super()
    }

    canActivate(): boolean {
        this.logger.warn('Using Development ONLY route')
        return this.config.get('NODE_ENV') === 'development'
    }
}
