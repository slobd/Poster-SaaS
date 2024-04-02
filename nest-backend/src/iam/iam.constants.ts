/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const CASBIN_ENFORCER = 'CASBIN_ENFORCER'

export const GUEST = 'GUEST'

export const PosterLab = 'PosterLab'

export enum Actions {
    CREATE = 'CREATE',
    ADD = 'ADD',
    READ_ONE = 'READ_ONE',
    READ_ALL = 'READ_ALL',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    GRANT = 'GRANT',
    ADMIN = 'ADMIN',
    // Posters only
    EDIT_CONTENT = 'EDIT_CONTENT',
    EDIT_ONLINE_SESSION = 'EDIT_ONLINE_SESSION',
    MEMBER = 'MEMBER',
}

export enum Resources {
    USER = 'USER',
    POSTER = 'POSTER',
    POSTER_UPLOAD = 'POSTER_UPLOAD',
    POSTER_CANVAS = 'POSTER_CANVAS',
    ROLE = 'ROLE',
    COMMENT = 'COMMENT',
    FIND_EXPERTS = 'FIND_EXPERTS',
    LIVE_SESSION = 'LIVE_SESSION',
    TENANT = 'TENANT',
}

/*
    TODO: Find how to put the actions in an array
    [Resources.POSTER]: [Actions.READ, Actions.EDIT, Actions.ADMIN]

    TODO: Avoid repeating code. ResourceAndActions is used to infer the return type of the factory
    functions later
*/

export const ResourcesAndActions = {
    POSTER: {
        READ_ONE: Actions.READ_ONE,
        READ_ALL: Actions.READ_ALL,
        EDIT: Actions.EDIT,
        ADMIN: Actions.ADMIN,
        EDIT_ONLINE_SESSION: Actions.EDIT_ONLINE_SESSION,
    },
    POSTER_UPLOAD: {
        CREATE: Actions.CREATE,
    },
    POSTER_CANVAS: {
        CREATE: Actions.CREATE,
    },
    ROLE: {
        READ_ALL: Actions.READ_ALL,
        GRANT: Actions.GRANT,
        CREATE: Actions.CREATE,
        ADMIN: Actions.ADMIN,
    },
    USER: {
        READ_ALL: Actions.READ_ALL,
        ADD: Actions.ADD,
    },
    COMMENT: {
        DELETE: Actions.DELETE,
        CREATE: Actions.CREATE,
    },
    FIND_EXPERTS: {
        READ_ALL: Actions.READ_ALL,
    },
    LIVE_SESSION: {
        /**
         * - Can create a new live session
         */
        CREATE: Actions.CREATE,
        /**
         * - Can stop a running live session
         */
        EDIT: Actions.EDIT,
        /**
         * - Can see live session feature
         */
        READ_ALL: Actions.READ_ALL,
    },
    TENANT: {
        /**
         * - Allows the user to change the tenant settings
         */
        ADMIN: Actions.ADMIN,
    },
}

type ResourceAndActionsKeys = keyof typeof ResourcesAndActions

type ActionsKeys<T extends ResourceAndActionsKeys> =
    typeof ResourcesAndActions[T]

type PermissionKeyFields = {
    [Res in ResourceAndActionsKeys]: {
        [Act in keyof ActionsKeys<Res>]:
            | (() => [Res, Act])
            | ((id?: string | number) => [string, Act])
    }
}

function TupleFactory<R, A>(res: R, act: A): () => [typeof res, typeof act] {
    return () => [res, act]
}

function TupleFactoryByID<R, A>(
    res: R,
    act: A,
): (arg0: string) => [string, typeof act] {
    return (id) => [`${res}/${id}`, act]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IPermissions extends PermissionKeyFields {}

export type IUserPermissions = {
    [Res in ResourceAndActionsKeys]: {
        [Act in keyof ActionsKeys<Res>]: boolean
    }
}
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

export type TResourcePermissions = Optional<
    IUserPermissions,
    ResourceAndActionsKeys
>

// TODO: Show error if the resource is different as expected
export const permissions: IPermissions = {
    POSTER_UPLOAD: {
        CREATE: TupleFactory(Resources.POSTER_UPLOAD, Actions.CREATE),
    },
    POSTER_CANVAS: {
        CREATE: TupleFactory(Resources.POSTER_CANVAS, Actions.CREATE),
    },
    POSTER: {
        EDIT: TupleFactoryByID(Resources.POSTER, Actions.EDIT),
        ADMIN: TupleFactoryByID(Resources.POSTER, Actions.ADMIN),
        READ_ONE: TupleFactoryByID(Resources.POSTER, Actions.READ_ONE),
        READ_ALL: TupleFactory(Resources.POSTER, Actions.READ_ALL),
        EDIT_ONLINE_SESSION: TupleFactoryByID(
            Resources.POSTER,
            Actions.EDIT_ONLINE_SESSION,
        ),
    },
    COMMENT: {
        CREATE: TupleFactory(Resources.COMMENT, Actions.CREATE),
        DELETE: TupleFactoryByID(Resources.COMMENT, Actions.DELETE),
    },
    ROLE: {
        READ_ALL: TupleFactory(Resources.ROLE, Actions.READ_ALL),
        GRANT: TupleFactoryByID(Resources.ROLE, Actions.GRANT),
        CREATE: TupleFactory(Resources.ROLE, Actions.CREATE),
        ADMIN: TupleFactory(Resources.ROLE, Actions.ADMIN),
    },
    USER: {
        READ_ALL: TupleFactory(Resources.USER, Actions.READ_ALL),
        ADD: TupleFactory(Resources.USER, Actions.ADD),
    },
    FIND_EXPERTS: {
        READ_ALL: TupleFactory(Resources.FIND_EXPERTS, Actions.READ_ALL),
    },
    LIVE_SESSION: {
        CREATE: TupleFactory(Resources.LIVE_SESSION, Actions.CREATE),
        EDIT: TupleFactoryByID(Resources.LIVE_SESSION, Actions.EDIT),
        READ_ALL: TupleFactory(Resources.LIVE_SESSION, Actions.READ_ALL),
    },
    TENANT: {
        ADMIN: TupleFactoryByID(Resources.TENANT, Actions.ADMIN),
    },
}
