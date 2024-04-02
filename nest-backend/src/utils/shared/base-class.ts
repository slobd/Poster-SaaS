import { Logger } from '@nestjs/common'

export class BaseClass {
    protected readonly logger = new Logger(this.constructor.name)
}
