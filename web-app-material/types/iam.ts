export const GUEST = 'GUEST'
export const AUTH = 'AUTH'
export const MEMBER = 'MEMBER' // Auth and member of the organization
export const ADMIN = 'ADMIN'

export const PosterLab = 'PosterLab'

export enum Actions {
    CREATE = 'CREATE',
    ADD = 'ADD',
    READ_ONE = 'READ_ONE', // Read by id => GET "/:id"
    READ_ALL = 'READ_ALL', // Read all => GET "/"
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    GRANT = 'GRANT',
    ADMIN = 'ADMIN',
    GROUP = 'GROUP',
    MEMBER = 'MEMBER',
    // Posters only
    EDIT_CONTENT = 'EDIT_CONTENT',
    EDIT_ONLINE_SESSION = 'EDIT_ONLINE_SESSION',
}

export enum Resources {
    USER = 'USER',
    POSTER = 'POSTER',
    POSTER_UPLOAD = 'POSTER_UPLOAD',
    POSTER_CANVAS = 'POSTER_CANVAS',
    ROLE = 'ROLE',
    COMMENT = 'COMMENT',
    FIND_EXPERTS = 'FIND_EXPERTS',
    TENANT = 'TENANT',
    LIVE_SESSION = 'LIVE_SESSION',
}

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

export interface UserName {
    firstName?: string
    lastName?: string
}
