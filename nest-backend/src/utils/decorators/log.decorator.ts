export function Log() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const original = descriptor.value
        if (typeof original == 'function') {
            descriptor.value = function (...args) {
                console.log(`${propertyKey} args:`, args)
                const result = original.apply(this, args)
                // TODO: Handle promises
                console.log(`${propertyKey} result:`, result)
                return result
            }
        }
        return descriptor
    }
}
