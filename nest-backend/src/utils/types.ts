/**
 * Only generic types that will be used across the whole app should be defined here.
 * Otherwise, defined the types inside the corresponding module
 */

/**
 *
 */
export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T
}

export abstract class Event {
    abstract NAME: string

    static getName
}

/**
 * This utility helps to enforce the implementation of static members,
 * it's a bit of a hack around Typescript features, for more information check:
 * - https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
 * - Some discussion around the topic: https://github.com/microsoft/TypeScript/issues/34516
 */
export type StaticImplements<
    I extends new (...args: any[]) => any,
    C extends I,
> = InstanceType<I>

export interface IEventName {
    new (...args: any[]): any

    NAME: string
}

export type IEvent<T extends IEventName> = StaticImplements<IEventName, T>
