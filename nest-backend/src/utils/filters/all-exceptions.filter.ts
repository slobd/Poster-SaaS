import {
    Catch,
    ArgumentsHost,
    Logger,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry'
import { HttpException } from '@nestjs/common/exceptions/http.exception'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    // logger = new Logger(AllExceptionsFilter.name)
    private readonly logger = new Logger(AllExceptionsFilter.name)

    constructor(
        @InjectSentry() private readonly sentry: SentryService, // private readonly logger: Logger,
    ) {
        super()
    }

    //

    catch(exception: HttpException, host: ArgumentsHost): void {
        // this.logger.error(exception)
        const Sentry = this.sentry.instance()
        const req = host.switchToHttp().getRequest()

        Sentry.captureException(exception)

        super.catch(exception, host)

        if (exception instanceof BadRequestException) {
            this.logger.error(exception.message, exception.stack, {
                path: req.path,
            })
        }
        if (exception instanceof InternalServerErrorException) {
            this.logger.error(exception.message, exception.stack)
        }
    }
}
