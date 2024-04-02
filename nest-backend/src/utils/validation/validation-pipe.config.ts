import { BadRequestException, ValidationPipeOptions } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import * as _ from 'lodash'
import * as util from 'util'

export const validationPipeOption: ValidationPipeOptions = {
    whitelist: true,
    // skipMissingProperties: true,
    transform: true,
    validationError: {
        value: true,
        target: false,
    },
    exceptionFactory(errors: ValidationError[]): BadRequestException {
        const errorResponse = processValidationErrors(errors)
        console.log(
            util.inspect(errorResponse, { showHidden: false, depth: null }),
        )
        return new BadRequestException({ error: errorResponse })
    },
}

function processValidationErrors(errors: ValidationError[]) {
    return _.mapValues(_.keyBy(errors, 'property'), (error) => {
        console.log('error', error)
        if (error.children === undefined || error.children.length === 0) {
            return _.values(error.constraints)
        } else {
            return processValidationErrors(error.children)
        }
    })
}
