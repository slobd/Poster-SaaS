import { RawRuleOf } from '@casl/ability'
import {
    ActionEnum,
    AppAbility,
    FeaturesEnum,
    FeaturesTable,
    GalleryRules,
    IdentityManagementRules,
    SubjectEnum,
    AccessControlRules,
    TenantManagementRules,
    WorkspaceRules,
    ProjectRules,
    PeopleRules,
    CommentRules,
    BoardRules,
    InviteRules,
} from '@/access-control/access-control.types'
import { User } from '@/iam/users/entities/user.entity'
import { PosterVisibilityEnum, ProjectVisibilityEnum } from '@prisma/client'

export const RoleDomain = {
    Tenant: (tenantId: number): string => `Tenant/${tenantId}`,
    Workspace: (workspaceId: number): string => `Workspace/${workspaceId}`,
}

// User to search users in the organization. E.g. in poster's coauthor page
const listUsersFields: (keyof User)[] = [
    'id',
    'firstName',
    'lastName',
    'email',
    'isDummyUser',
    'organizationName',
    'avatar',
]

/**
 * Conditions for list actions are mostly evaluated upon the Workspace entity
 * or the entity the which the "Subject" belongs to
 * e.g. Posters belong to Workspace, so we evaluate the conditions of the workspace
 * Another analogy would be the list objects permission of an S3 buckets
 * the permissions is relative to the bucket not to the objects inside
 */

/**
 * We can use helpers/interpolate and the options array to know which arguments are needed for the rule
 */
export const FeaturesRules: FeaturesTable = {
    AccessControl: {
        /**
         * TODO: Route not implemented
         */
        listRoles: {
            name: AccessControlRules.listRoles,
            feature: FeaturesEnum.AccessControl, // Is this a feature?
            description: 'Allow the user to list roles',
            subject: SubjectEnum.Role,
            action: ActionEnum.list,
            // No specific conditions apply, user just need Role, list and Role, read for the domain
            getConditions: (_opts) => ({
                conditions: {},
            }),
            options: [],
        },
        readRole: {
            name: AccessControlRules.readRole,
            feature: FeaturesEnum.AccessControl, // Is this a feature?
            description: 'Allow the user to view all the roles of a domain',
            subject: SubjectEnum.Role,
            action: ActionEnum.read,
            getConditions: (opts) => ({
                conditions: {
                    domain: opts.domain, // e.g tenant/1, workspace/2
                },
            }),
            options: [
                {
                    name: 'Domain',
                    key: 'domain',
                    description: 'Domain of the role, e.g workspace or tenant',
                },
            ],
        },
        updateUserRole: {
            name: AccessControlRules.updateUserRole,
            feature: FeaturesEnum.AccessControl, // Is this a feature?
            description: 'Allows to update the role of a user in a domain',
            subject: SubjectEnum.User,
            action: ActionEnum.update,
            getConditions: (opts) => ({
                fields: ['roles'],
                conditions: {
                    'roles.role.domain': opts.domain, // e.g tenant/1, workspace/2
                },
            }),
            options: [
                {
                    name: 'Domain',
                    key: 'domain',
                    description: 'Domain of the role, e.g workspace or tenant',
                },
            ],
        },
    },
    Invite: {
        [InviteRules.readWorkspacePublicInvite]: {
            name: InviteRules.readWorkspacePublicInvite,
            feature: FeaturesEnum.Invite,
            description:
                'Grant permission to see the workspace public invite url',
            subject: SubjectEnum.Invite,
            action: ActionEnum.read,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspaceId'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you update the invite url',
                    key: 'workspaceId',
                },
            ],
        },
        [InviteRules.updateWorkspacePublicInvite]: {
            name: InviteRules.updateWorkspacePublicInvite,
            feature: FeaturesEnum.Invite,
            description:
                'Grant permission to enable and disable the workspace public invite url',
            subject: SubjectEnum.Invite,
            action: ActionEnum.update,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you update the invite url',
                    key: 'workspaceId',
                },
            ],
        },
    },
    Gallery: {
        createPoster: {
            name: GalleryRules.createPoster,
            feature: FeaturesEnum.Gallery,
            description: 'Allow the user to upload a file',
            subject: SubjectEnum.Poster,
            action: ActionEnum.create,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        listPosters: {
            name: GalleryRules.listPosters,
            feature: FeaturesEnum.Gallery,
            description:
                'Allow the user to list multiple posters. Files listed depend on the readPoster rules',
            subject: SubjectEnum.Poster,
            action: ActionEnum.list,
            /**
             * Conditions are evaluated upon the Workspace entity
             * @param opts
             */
            getConditions: (opts: {
                workspaceId: number
                tenantId: number
            }): Pick<RawRuleOf<AppAbility>, 'conditions' | 'fields'> => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        readPoster: {
            name: GalleryRules.readPoster,
            feature: FeaturesEnum.Gallery,
            description: 'Allow the user to view a file',
            subject: SubjectEnum.Poster,
            action: ActionEnum.read,
            getConditions: (opts) => {
                const conditions: any = {}

                if (opts.id && opts.id !== '*') conditions.id = opts.id
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                // We use a boolean as an option instead of a string so that no one
                // can pass PRIVATE by mistake
                if (opts.public)
                    conditions.visibility = PosterVisibilityEnum.PUBLIC

                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'File Id',
                    description: 'Id of the file that can be read',
                    key: 'id',
                },
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
                {
                    name: 'See public posters',
                    description:
                        'If true the user can see posters with PUBLIC visibility',
                    key: 'public',
                },
            ],
        },
        updatePoster: {
            name: GalleryRules.updatePoster,
            feature: FeaturesEnum.Gallery,
            description: 'Allow the user to update a file',
            subject: SubjectEnum.Poster,
            action: ActionEnum.update,
            getConditions: (opts) => {
                const conditions: any = {}

                if (opts.id !== '*') conditions.id = opts.id
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'File Id',
                    description: 'Id of the file that can be read',
                    key: 'id',
                },
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        deletePoster: {
            name: GalleryRules.deletePoster,
            feature: FeaturesEnum.Gallery,
            description: 'Allow the user to delete a file',
            subject: SubjectEnum.Poster,
            action: ActionEnum.delete,
            getConditions: (opts) => {
                const conditions: any = {}

                if (opts.id !== '*') conditions.id = opts.id
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'File Id',
                    description: 'Id of the file that can be deleted',
                    key: 'id',
                },
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
    },
    Comment: {
        // Give those two the workspace roles
        createComment: {
            name: CommentRules.createComment,
            feature: FeaturesEnum.Comment,
            description:
                'Grant permission to create a comment for a poster inside a workspace',
            subject: SubjectEnum.Comment,
            action: ActionEnum.create,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can create a comment',
                    key: 'workspaceId',
                },
            ],
        },
        listComments: {
            name: CommentRules.listComments,
            feature: FeaturesEnum.Comment,
            description:
                'Grant permission to list users with topics, keywords and activity inside the Workspace.',
            subject: SubjectEnum.Comment,
            action: ActionEnum.list,
            // Evaluated upon poster
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can list users',
                    key: 'workspaceId',
                },
            ],
        },
        // Every user should have this
        // Options:
        // 1. Give to every user
        // 2. Generate dynamically
        deleteOwnComment: {
            name: CommentRules.deleteOwnComment,
            feature: FeaturesEnum.Comment,
            description:
                'Grant permission to create a comment for a poster inside a workspace',
            subject: SubjectEnum.Comment,
            action: ActionEnum.delete,
            getConditions: (opts) => ({
                conditions: {
                    'user.id': 'userId',
                },
            }),
            options: [
                {
                    name: 'User Id',
                    description:
                        'Id of the user who is the author of the comment',
                    key: 'userId',
                },
            ],
        },
        // Give to the owner of the poster when the poster is created
        deleteCommentOfPoster: {
            name: CommentRules.deleteCommentOfPoster,
            feature: FeaturesEnum.Comment,
            description:
                'Grant permission to create a comment for a poster inside a workspace',
            subject: SubjectEnum.Comment,
            action: ActionEnum.delete,
            getConditions: (opts) => ({
                conditions: {
                    'poster.id': opts.posterId,
                },
            }),
            options: [
                {
                    name: 'Poster Id',
                    description: 'Id of the poster the comment was written on',
                    key: 'posterId',
                },
            ],
        },
        // Give to admin/owner of workspace
        deleteCommentOfWorkspace: {
            name: CommentRules.deleteCommentOfWorkspace,
            feature: FeaturesEnum.Comment,
            description:
                'Grant permission to create a comment for a poster inside a workspace',
            subject: SubjectEnum.Comment,
            action: ActionEnum.delete,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['poster.workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['poster.workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace of the poster',
                    key: 'workspaceId',
                },
            ],
        },
    },
    IdentityManagement: {
        /**
         * TODO: Implementation must change since currently we create or invite a user
         *  if he already exist
         */
        createUser: {
            name: IdentityManagementRules.createUser,
            feature: FeaturesEnum.IdentityManagement,
            description:
                'Grant permission to create a user inside the organization',
            subject: SubjectEnum.User,
            action: ActionEnum.create,
            getConditions: (opts) => ({
                conditions: {
                    'tenant.id': opts.tenantId,
                },
            }),
            options: [
                {
                    name: 'Tenant Id',
                    description:
                        'Id of the tenant to which you can invite users',
                    key: 'tenantId',
                },
            ],
        },
        /**
         * TODO: Only limited information is show. This is useful for the
         *  search user in workspace functionality. where the user
         *  only name, profile image and id are required
         */
        listUsers: {
            name: IdentityManagementRules.listUsers,
            feature: FeaturesEnum.IdentityManagement,
            description:
                'Grant permission to list users inside the organization.',
            subject: SubjectEnum.User,
            action: ActionEnum.list,
            getConditions: (opts) => ({
                fields: listUsersFields, // All fields but the password
                conditions: {
                    // TODO: There is currently no tenant property on the user
                    'tenant.id': opts.tenantId,
                },
            }),
            options: [
                {
                    name: 'Tenant Id',
                    description:
                        'Id of the tenant from which you can list users',
                    key: 'tenantId',
                },
            ],
        },
        listIAMUsers: {
            name: IdentityManagementRules.listIAMUsers,
            feature: FeaturesEnum.IdentityManagement,
            description:
                'Grant permission to list all the users with their IAM information inside the organization.',
            subject: SubjectEnum.User,
            action: ActionEnum.list,
            getConditions: (opts) => ({
                fields: [], // All fields but the password
                conditions: {
                    // TODO: There is currently no tenant property on the user
                    'tenant.id': opts.tenantId,
                },
            }),
            options: [
                {
                    name: 'Tenant Id',
                    description:
                        'Id of the tenant from which you can list users',
                    key: 'tenantId',
                },
            ],
        },
    },
    Project: {
        updatePublicProject: {
            name: ProjectRules.updatePublicProject,
            feature: FeaturesEnum.Project,
            description: 'Allow the user to update a public project',
            subject: SubjectEnum.Project,
            action: ActionEnum.update,
            getConditions: (opts: {
                id: string
                workspaceId: number
                tenantId: number
            }) => {
                const conditions: any = {
                    visibility: ProjectVisibilityEnum.PUBLIC,
                }
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        createProject: {
            name: ProjectRules.createProject,
            feature: FeaturesEnum.Project,
            description: 'Grants permission for users to create a new project',
            subject: SubjectEnum.Project,
            action: ActionEnum.create,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspaceId'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can create projects',
                    key: 'workspaceId',
                },
            ],
        },
        readProject: {
            name: ProjectRules.readProject,
            description:
                'Grant permission for the user to read a project with Id',
            feature: FeaturesEnum.Project,
            subject: SubjectEnum.Project,
            action: ActionEnum.read,
            getConditions: (opts) => {
                const conditions = {
                    visibility: ProjectVisibilityEnum.PUBLIC,
                    deleted: false,
                } as any
                if (opts.workspaceId)
                    conditions['workspaceId'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can read workspaces',
                    key: 'workspaceId',
                },
            ],
        },
        listProjects: {
            name: ProjectRules.listProjects,
            description:
                'Grant permission to the user to list all projects in the workspace',
            feature: FeaturesEnum.Project,
            subject: SubjectEnum.Project,
            action: ActionEnum.list,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can read workspaces',
                    key: 'workspaceId',
                },
            ],
        },
        deletePublicProject: {
            name: ProjectRules.deletePublicProject,
            feature: FeaturesEnum.Project,
            description: 'Allow the user to delete a public project',
            subject: SubjectEnum.Project,
            action: ActionEnum.delete,
            getConditions: (opts) => {
                const conditions = {
                    visibility: ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
    },
    Workspace: {
        createWorkspace: {
            name: WorkspaceRules.createWorkspace,
            feature: FeaturesEnum.Workspace,
            description:
                'Grant permission for the user to create a new workspace',
            subject: SubjectEnum.Workspace,
            action: ActionEnum.create,
            getConditions: (opts) => ({
                conditions: {
                    tenantId: opts.tenantId,
                },
            }),
            options: [
                {
                    name: 'Tenant Id',
                    description:
                        'Id of the tenant to which you can create a workspace',
                    key: 'tenantId',
                },
            ],
        },
        // listWorkspaces: {
        //     name: WorkspaceRules.listWorkspaces,
        //     description:
        //         'Grant permission to user for listing workspaces in a tenant',
        //     feature: FeaturesEnum.Workspace,
        //     subject: SubjectEnum.Workspace,
        //     action: ActionEnum.list,
        //     getConditions: (opts) => ({
        //         conditions: {
        //             id: opts.tenantId,
        //         },
        //     }),
        //     options: [
        //         {
        //             name: 'Tenant Id',
        //             description: 'Id of the tenant',
        //             key: 'tenantId',
        //         },
        //     ],
        // },
        readWorkspace: {
            name: WorkspaceRules.readWorkspace,
            feature: FeaturesEnum.Workspace,
            description: 'Grant permission to read a workspace with Id',
            subject: SubjectEnum.Workspace,
            action: ActionEnum.read,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can fetch information',
                    key: 'workspaceId',
                },
                {
                    name: 'Tenant Id',
                    description:
                        'Id of the tenant to which you can fetch information',
                    key: 'tenantId',
                },
            ],
        },
        updateWorkspace: {
            name: WorkspaceRules.updateWorkspace,
            feature: FeaturesEnum.Workspace,
            description: 'Grant permission to read a workspace with Id',
            subject: SubjectEnum.Workspace,
            action: ActionEnum.update,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can fetch information',
                    key: 'workspaceId',
                },
            ],
        },
        deleteWorkspace: {
            name: WorkspaceRules.deleteWorkspace,
            feature: FeaturesEnum.Workspace,
            description: 'Grant permission to delete a workspace with Id',
            subject: SubjectEnum.Workspace,
            action: ActionEnum.delete,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        inviteUsersToWorkspace: {
            name: WorkspaceRules.inviteUsersToWorkspace,
            feature: FeaturesEnum.Workspace,
            description:
                'Grant permission to the user to invite users to the workspace with Id',
            subject: SubjectEnum.User,
            action: ActionEnum.create,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can invite users',
                    key: 'workspaceId',
                },
            ],
        },
        listWorkspaceUsers: {
            name: WorkspaceRules.listWorkspaceUsers,
            feature: FeaturesEnum.Workspace,
            description:
                'Grant permission to list users with topics, keywords and activity inside the Workspace.',
            subject: SubjectEnum.User,
            action: ActionEnum.list,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can list users',
                    key: 'workspaceId',
                },
            ],
        },
    },
    People: {
        listWorkspaceUsers: {
            name: PeopleRules.listWorkspaceUsers,
            feature: FeaturesEnum.People,
            description:
                'Grant permission to list users with topics, keywords and activity inside the Workspace.',
            subject: SubjectEnum.User,
            action: ActionEnum.list,
            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId) conditions['id'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can list users',
                    key: 'workspaceId',
                },
            ],
        },
        readWorkspaceUser: {
            name: PeopleRules.readWorkspaceUser,
            feature: FeaturesEnum.People,
            description:
                'Grant privilege for the user to read a workspace user',
            subject: SubjectEnum.User,
            action: ActionEnum.read,

            getConditions: (opts) => {
                const conditions = {} as any
                if (opts.workspaceId)
                    conditions['workspaceId'] = opts.workspaceId
                if (opts.tenantId) conditions['tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can list users',
                    key: 'workspaceId',
                },
            ],
        },
    },
    TenantManagement: {
        updateBasicInfo: {
            name: TenantManagementRules.updateBasicInfo,
            feature: FeaturesEnum.TenantManagement,
            description: 'Grant permission to update a tenant.',
            subject: SubjectEnum.Tenant,
            action: ActionEnum.update,
            getConditions: (opts) => ({
                // TODO: Add updatable fields
                // fields: [],
                conditions: {
                    'tenant.id': opts.tenantId,
                },
            }),
            options: [
                {
                    name: 'Tenant Id',
                    description: 'Id of the tenant',
                    key: 'tenantId',
                },
            ],
        },
        readTenantWithWorkspaces: {
            name: TenantManagementRules.readTenantWithWorkspaces,
            feature: FeaturesEnum.TenantManagement,
            description:
                'Grant permission to list all workspaces under a Tenant',
            subject: SubjectEnum.Tenant,
            action: ActionEnum.read,
            getConditions: (opts) => ({
                conditions: {
                    id: opts.tenantId,
                },
            }),
            options: [
                {
                    name: 'Tenant Id',
                    description: 'Id of the tenant',
                    key: 'tenantId',
                },
            ],
        },
    },
    Board: {
        [BoardRules.readBoardOfPublicProject]: {
            name: BoardRules.readBoardOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to see a board of public projects',
            subject: SubjectEnum.Board,
            action: ActionEnum.read,
            getConditions: (opts) => {
                const conditions = {
                    'project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['project.workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['project.workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.createTaskOfPublicProject]: {
            name: BoardRules.createTaskOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to create a task in public projects',
            subject: SubjectEnum.Task,
            action: ActionEnum.create,
            // TODO: Create action should also use PIP
            getConditions: (opts) => {
                const conditions = {
                    'board.project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['board.project.workspaceId'] = opts.workspaceId
                if (opts.tenantId) conditions['board.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.readTaskOfPublicProject]: {
            name: BoardRules.readTaskOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to see a task of public projects',
            subject: SubjectEnum.Task,
            action: ActionEnum.read,
            getConditions: (opts) => {
                const conditions = {
                    'board.project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['board.project.workspaceId'] = opts.workspaceId
                if (opts.tenantId) conditions['board.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.updateTaskOfPublicProject]: {
            name: BoardRules.updateTaskOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to update a task of public projects',
            subject: SubjectEnum.Task,
            action: ActionEnum.update,
            getConditions: (opts) => {
                const conditions = {
                    'board.project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['board.project.workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['board.project.workspace.tenantId'] =
                        opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.deleteTaskOfPublicProject]: {
            name: BoardRules.deleteTaskOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to delete a task of public projects',
            subject: SubjectEnum.Task,
            action: ActionEnum.delete,
            getConditions: (opts) => {
                const conditions = {
                    'board.project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['board.project.workspace.id'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['board.project.workspace.tenantId'] =
                        opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.createBoardOfPublicProject]: {
            name: BoardRules.createBoardOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to create a board in public projects',
            subject: SubjectEnum.Board,
            action: ActionEnum.create,
            // TODO: Create action should also use PIP
            getConditions: (opts) => {
                const conditions = {
                    'project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['project.workspaceId'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['project.workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.updateBoardOfPublicProject]: {
            name: BoardRules.updateBoardOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to update board in public projects',
            subject: SubjectEnum.Board,
            action: ActionEnum.update,
            // TODO: Create action should also use PIP
            getConditions: (opts) => {
                const conditions = {
                    'project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['project.workspaceId'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['project.workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        [BoardRules.deleteBoardOfPublicProject]: {
            name: BoardRules.deleteBoardOfPublicProject,
            feature: FeaturesEnum.Board,
            description: 'Allow the user to delete a board in public projects',
            subject: SubjectEnum.Board,
            action: ActionEnum.delete,
            // TODO: Create action should also use PIP
            getConditions: (opts) => {
                const conditions = {
                    'project.visibility': ProjectVisibilityEnum.PUBLIC,
                } as any
                if (opts.workspaceId)
                    conditions['project.workspaceId'] = opts.workspaceId
                if (opts.tenantId)
                    conditions['project.workspace.tenantId'] = opts.tenantId
                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
    },
}
