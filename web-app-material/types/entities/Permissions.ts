import { ResourcesAndActions } from '../iam'

type ResourceAndActionsKeys = keyof typeof ResourcesAndActions

type ActionsKeys<T extends ResourceAndActionsKeys> = typeof ResourcesAndActions[T]

type PermissionKeyFields = {
    [Res in ResourceAndActionsKeys]: {
        [Act in keyof ActionsKeys<Res>]:
            | (() => [Res, Act])
            | ((id?: string | number) => [string, Act])
    }
}

export interface IPermissions extends PermissionKeyFields {}

// type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

export type IPermission = Optional<IPermissions, ResourceAndActionsKeys>

type TPermissionKeyFields = {
    [Res in ResourceAndActionsKeys]: {
        [Act in keyof ActionsKeys<Res>]: boolean
    }
}

export interface IUserPermissions extends TPermissionKeyFields {}
export type TResourcePermissions = Optional<IUserPermissions, ResourceAndActionsKeys>

export const DefaultPermissions: IUserPermissions = {
    POSTER: {
        READ_ONE: false,
        READ_ALL: false,
        EDIT: false,
        ADMIN: false,
        EDIT_ONLINE_SESSION: false,
    },
    POSTER_UPLOAD: {
        CREATE: false,
    },
    POSTER_CANVAS: {
        CREATE: false,
    },
    ROLE: {
        READ_ALL: false,
        GRANT: false,
        CREATE: false,
        ADMIN: false,
    },
    USER: {
        READ_ALL: false,
        ADD: false,
    },
    COMMENT: {
        DELETE: false,
        CREATE: false,
    },
    FIND_EXPERTS: {
        READ_ALL: false,
    },
    LIVE_SESSION: {
        CREATE: true,
        READ_ALL: true,
        EDIT: true,
    },
    TENANT: {
        ADMIN: true,
    },
}
