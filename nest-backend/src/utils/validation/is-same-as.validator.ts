import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator'

export function IsSameAs<E>(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: E, propertyName: string): void {
        registerDecorator({
            name: 'IsSameAs',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints
                    const relatedValue = (args.object as any)[
                        relatedPropertyName
                    ]
                    return value === relatedValue
                },
            },
        })
    }
}
