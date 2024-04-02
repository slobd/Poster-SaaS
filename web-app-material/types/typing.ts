import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { Author } from './entities/Author.entity'
import { User } from './entities/User.entity'
import { Resources, Actions } from './iam'

export enum HttpStatus {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    EARLYHINTS = 103,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    AMBIGUOUS = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    I_AM_A_TEAPOT = 418,
    MISDIRECTED = 421,
    UNPROCESSABLE_ENTITY = 422,
    FAILED_DEPENDENCY = 424,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
}

/**
 * Convention:
 * - The name of the route and the name of the property MUST match
 * - forward slashes "/" are substituted by underscores "_"
 * - "ID" substitutes any Param of the route
 * - The number of IDs in the property must match the number of arguments of the function
 *      WORKSPACES_ID_USERS: (workspaceId) => `/workspaces/${workspaceId}/users`
 *      WORKSPACES_ID_USERS_ID: (workspaceId, userId) => `/workspaces/${workspaceId}/users/${userId}`
 *
 */
export const APIRoutesV2 = {
    WORKSPACES: '/workspaces',
    WORKSPACES_ID: (workspaceId) => `/workspaces/${workspaceId}`,
    WORKSPACES_ID_USERS: (workspaceId) => `/workspaces/${workspaceId}/users`,
    WORKSPACES_ID_USERS_ID: (workspaceId, userId) => `/workspaces/${workspaceId}/users/${userId}`,
    WORKSPACES_ID_PEOPLE: (workspaceId) => `/workspaces/${workspaceId}/people`,
    WORKSPACES_ID_PEOPLE_ID: (workspaceId, userId) => `/workspaces/${workspaceId}/people/${userId}`,
    WORKSPACES_ID_RECOMMENDED_ID: (workspaceId, userId) =>
        `/workspaces/${workspaceId}/recommended/${userId}`,
    WORKSPACES_ID_POSTERS: (workspaceId) => `/workspaces/${workspaceId}/posters`,
    WORKSPACES_ID_POSTERS_ID: (workspaceId, posterId) =>
        `/workspaces/${workspaceId}/posters/${posterId}`,
    WORKSPACES_ID_MESSAGE_ID: (workspaceId, userId) =>
        `/workspaces/${workspaceId}/message/${userId}`,
    IDENTITY_PROVIDER__EMAIL: '/identity-provider/email',
    IAM__INVITE: '/iam/invite',
    IAM__INVITE__ACCEPT_INVITE: '/iam/invite/accept-invite',
    IAM__INVITE__PUBLIC_INVITE: '/iam/invite/public-invite',
    IAM__INVITE__ID: (inviteId) => `/iam/invite/${inviteId}`,
    WORKSPACES_ID_PROJECTS: (workspaceId) => `workspaces/${workspaceId}/projects`,
    WORKSPACES_ID_PROJECTS_ID: (workspaceId, projectId) =>
        `workspaces/${workspaceId}/projects/${projectId}`,
    WORKSPACES_ID_PROJECTS_ID_UPLOADS: (workspaceId, projectId) =>
        `workspaces/${workspaceId}/projects/${projectId}/uploads`,
    WORKSPACES_ID_PROJECTS_ID_UPLOADS_ID: (workspaceId, projectId, uploadId) =>
        `workspaces/${workspaceId}/projects/${projectId}/uploads/${uploadId}`,
    AUTH_USERS_PROFILES: () => '/auth/users/profiles',
    AUTH_USERS_SKILLS: () => '/auth/users/skills',
    POSTERS_ID_COMMENTS: (posterId) => `/posters/${posterId}/comments`,
    BOARDS: () => `/boards`,
    BOARDS_ID: (boardId) => `/boards/${boardId}`,
    TASKS: () => `/tasks`,
    TASKS_ID: (taskId) => `/tasks/${taskId}`,
    TASKS_ID_UPLOADS: (taskId) => `/tasks/${taskId}/uploads`,
    TASKS_ID_UPLOADS_ID: (taskId, uploadId) => `/tasks/${taskId}/uploads/${uploadId}`,
    AZURE__USERS__EMAIL: 'azure/users/email',
}

/**
 * @deprecated
 */
export enum APIRoutes {
    UPLOADS = '/uploads',
    POSTERS = '/posters',
    LOGIN = '/auth/login',
    REGISTER = '/auth/register',
    PROFILE = '/auth/profile',
    UPDATE_PROFILE = '/auth/users/profiles',
    CONFIRM_EMAIL = '/auth/confirm-email',
    RESET_PASSWORD = '/auth/reset-password',
    FORGOT_PASSWORD = '/auth/forgot-password',
    UPDATE_PASSWORD = '/auth/update-password',
    DB_SEEDER = '/database/seeder', // Use in dev only
    MAIL = '/mail',
    COMMENTS = '/comments',
    IAM_CAN_USER = '/iam/can-user',
    IAM_ROLES = '/iam/roles',
    IAM_USERS = '/iam/users',
    ACCESS_CONTROL__ROLES = '/access-control/roles',
    ACCESS_CONTROL__USERS__ME__RULES = '/access-control/users/me/rules',
    IAM_USERS_EXPERTS = '/iam/experts',
    IAM_EXPERTS_RECOMMEND = '/iam/experts/recommend',
    IAM_USERS_ROLE = '/iam/users/role',
    IAM_INVITE_LINK = '/invite',
    IAM_INVITE_USERS = '/invite/users',
    IAM_INVITE_USER = '/invite/user',
    IAM_PERMISSIONS = '/iam/permissions',
    TENANT_BY_ORIGIN = '/tenants/by-origin',
    EXPERTS = '/experts',
    REQUEST_COLLABORATION = '/iam/experts/request-collaboration',
    LIVESESSION = '/live-session',
    UPDATE_TERM_OF_USE_EVENT = '/auth/update-term-of-use-event',
    MANAGE_USERS = '/iam/manage-users',
    HOME = '/home',
    GALLERY = '/gallery',
}

// Export specific
export enum InviteUserSortEnum {
    ASD = 'ASC',
    BEST = 'BEST',
    DESC = 'DESC',
}

export type Icons = Record<string, IconDefinition>

export interface Person extends Author, User {}

export type TDPermission = [Resources, string | null, Actions][]
export type TPermissions = { or?: TDPermission; and?: TDPermission }
