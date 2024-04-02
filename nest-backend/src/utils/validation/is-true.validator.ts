import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator'

export function IsTrue(validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string): void {
        registerDecorator({
            name: 'isTrue',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: {
                message: (args: ValidationArguments) => {
                    return `${args.property} muss be true`
                },
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return typeof value === 'boolean' && value === true
                },
            },
        })
    }
}
