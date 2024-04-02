import { Injectable, LoggerService, Inject } from '@nestjs/common'
import { Level } from 'pino'
import { Params, PARAMS_PROVIDER_TOKEN, PinoLogger } from 'nestjs-pino'

@Injectable()
export class Logger implements LoggerService {
    private readonly contextName: string

    constructor(
        protected readonly logger: PinoLogger,
        @Inject(PARAMS_PROVIDER_TOKEN) { renameContext }: Params,
    ) {
        this.contextName = renameContext || 'context'
    }

    verbose(message: any, ...optionalParams: any[]): void {
        this.call('trace', message, ...optionalParams)
    }

    debug(message: any, ...optionalParams: any[]): void {
        this.call('debug', message, ...optionalParams)
    }

    log(message: any, ...optionalParams: any[]): void {
        this.call('info', message, ...optionalParams)
    }

    warn(message: any, ...optionalParams: any[]): void {
        this.call('warn', message, ...optionalParams)
    }

    error(message: any, ...optionalParams: any[]): void {
        this.call('error', message, ...optionalParams)
    }

    private call(level: Level, message: any, ...optionalParams: any[]) {
        const objArg: Record<string, any> = {}

        // optionalParams contains extra params passed to logger
        // context name is the last item
        let params: any[] = []
        if (optionalParams.length !== 0) {
            objArg[this.contextName] = optionalParams[optionalParams.length - 1]
            params = optionalParams.slice(0, -1)
        }

        if (typeof message === 'object') {
            if (message instanceof Error) {
                objArg.err = message
            } else {
                Object.assign(objArg, message)
            }
            this.logger[level](objArg, ...params)
        } else {
            if (level === 'error') {
                Object.assign(objArg, { trace: params[0] })
            }
            this.logger[level](objArg, message, ...params)
        }
    }
}
