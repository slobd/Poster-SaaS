import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class HelpersService {
    constructor(private readonly configService: ConfigService) {}

    getProtocolBaseOnEnv(): string {
        if (this.configService.get('NODE_ENV') === 'production') {
            return 'https'
        } else {
            return 'http'
        }
    }
}
