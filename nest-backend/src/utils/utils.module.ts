import { Global, Module } from '@nestjs/common'
import { HelpersService } from './services/helpers.service'
import { IsUnique } from './validation/is-unique.validator'

@Global()
@Module({
    providers: [
        IsUnique,
        HelpersService,
        // Logger
    ],
    exports: [
        HelpersService,
        // Logger
    ],
})
export class UtilsModule {}
