import { Ability, RawRuleOf } from '@casl/ability'
import { CreateRuleDto } from '@/access-control/entities/rule.entity'

/**
 * TODO: For rules with field level access control we need to specify which fields
 *  are valid based on the Resource
 */
export enum SubjectEnum {
    Poster = 'Poster',
    Role = 'Role',
    User = 'User',
    Tenant = 'Tenant',
    Workspace = 'Workspace',
    Project = 'Project',
    Comment = 'Comment',
    Invite = 'Invite',
    Task = 'Task',
    Board = 'Board',
}

export enum ActionEnum {
    create = 'create',
    read = 'read',
    list = 'list',
    update = 'update',
    delete = 'delete',
    manage = 'manage',
    joinBeforeStartData = 'joinBeforeStartData',
    requestCollaboration = 'requestCollaboration',
    join = 'join',
}

type CRUD =
    | ActionEnum.create
    | ActionEnum.read
    | ActionEnum.update
    | ActionEnum.delete
type CRLUD = CRUD | ActionEnum.list

type Abilities =
    | [CRUD, SubjectEnum.Role]
    | [CRLUD, SubjectEnum.Poster]
    | [
          (
              | ActionEnum.create
              | ActionEnum.list
              | ActionEnum.read
              | ActionEnum.update
              | ActionEnum.delete
              | ActionEnum.requestCollaboration
          ),
          SubjectEnum.User,
      ]
    | [ActionEnum.joinBeforeStartData, SubjectEnum.Tenant]
    | [ActionEnum.update, SubjectEnum.Tenant]
    | [ActionEnum.update, SubjectEnum.Project]
    | [CRLUD, SubjectEnum.Workspace]
    | [
          (
              | ActionEnum.update
              | ActionEnum.delete
              | ActionEnum.create
              | ActionEnum.list
          ),
          SubjectEnum.Comment,
      ]
    | [ActionEnum.update | ActionEnum.read, SubjectEnum.Invite]
    | [CRUD, SubjectEnum.Board]
    | [CRUD, SubjectEnum.Task]

export type AppAbility = Ability<Abilities>

export type RawRule = RawRuleOf<AppAbility>

export const createAbility = (
    rules: RawRuleOf<AppAbility>[],
): Ability<Abilities> => new Ability<Abilities>(rules)

export interface RuleMetadata<F extends FeaturesEnum, R> {
    subject: RawRuleOf<AppAbility>['subject']
    action: RawRuleOf<AppAbility>['action']
    feature: F
    name: R
    description: string
    fieldLevelAccess?: boolean
    getConditions: (
        opts?: any,
    ) => Pick<RawRuleOf<AppAbility>, 'conditions' | 'fields'>
    getCreateRuleDto?: (opts?: any) => CreateRuleDto
    options: RuleMetadataOptions[]
}

export interface RuleMetadataOptions {
    name: string
    description: string
    key: string
}

export enum FeaturesEnum {
    // IAM features
    AccessControl = 'AccessControl',
    IdentityManagement = 'IdentityManagement',
    Invite = 'Invite',
    //----------------
    Gallery = 'Gallery',
    Workspace = 'Workspace',
    TenantManagement = 'TenantManagement',
    Project = 'Project',
    People = 'People',
    Comment = 'Comment',
    Board = 'Board',
}

export interface Rules {
    AccessControlRules: AccessControlRules
    GalleryRules: GalleryRules
    IdentityManagementRules: IdentityManagementRules
    WorkspaceRules: WorkspaceRules
    TenantManagementRules: TenantManagementRules
    ProjectRules: ProjectRules
    PeopleRules: PeopleRules
    CommentRules: CommentRules
    BoardRules: BoardRules
    InviteRules: InviteRules
}

export enum AccessControlRules {
    readRole = 'readRole',
    listRoles = 'listRoles',
    updateUserRole = 'updateUserRole',
}

export enum GalleryRules {
    createPoster = 'createPoster',
    readPoster = 'readPoster',
    listPosters = 'listPosters',
    updatePoster = 'updatePoster',
    deletePoster = 'deletePoster',
}

export enum CommentRules {
    createComment = 'createComment',
    listComments = 'listComments',
    deleteOwnComment = 'deleteOwnComment',
    deleteCommentOfPoster = 'deleteCommentOfPoster',
    deleteCommentOfWorkspace = 'deleteCommentOfWorkspace',
}

export enum IdentityManagementRules {
    listUsers = 'listUsers',
    listIAMUsers = 'listIAMUsers',
    createUser = 'createUser',
}

export enum WorkspaceRules {
    createWorkspace = 'createWorkspace',
    readWorkspace = 'readWorkspace',
    updateWorkspace = 'updateWorkspace',
    //listWorkspaces = 'listWorkspaces',
    deleteWorkspace = 'deleteWorkspace',
    // Workspace user management
    inviteUsersToWorkspace = 'inviteUsersToWorkspace',
    listWorkspaceUsers = 'listWorkspaceUsers',
}

export enum PeopleRules {
    listWorkspaceUsers = 'listWorkspaceUsers',
    readWorkspaceUser = 'readWorkspaceUser',
}

export enum TenantManagementRules {
    updateBasicInfo = 'updateBasicInfo',
    readTenantWithWorkspaces = 'readTenantWithWorkspaces',
}

export enum ProjectRules {
    updatePublicProject = 'updatePublicProject',
    createProject = 'createProject',
    readProject = 'readProject',
    listProjects = 'listProjects',
    deletePublicProject = 'deletePublicProject',
}

export enum BoardRules {
    readBoardOfPublicProject = 'readBoardOfPublicProject',
    createTaskOfPublicProject = 'createTaskOfPublicProject',
    readTaskOfPublicProject = 'readTaskOfPublicProject',
    updateTaskOfPublicProject = 'updateTaskOfPublicProject',
    deleteTaskOfPublicProject = 'deleteTaskOfPublicProject',
    createBoardOfPublicProject = 'createBoardOfPublicProject',
    updateBoardOfPublicProject = 'updateBoardOfPublicProject',
    deleteBoardOfPublicProject = 'deleteBoardOfPublicProject',
}

export enum InviteRules {
    updateWorkspacePublicInvite = 'updateWorkspacePublicInvite',
    readWorkspacePublicInvite = 'readWorkspacePublicInvite',
}

export type RawRuleWithFeature = RawRuleOf<AppAbility> & {
    feature: FeaturesEnum
}

export type FeaturesTable = {
    [Feature in FeaturesEnum]: FeatureRulesTable<
        Rules[`${Feature}Rules`],
        Feature
    >
}

type FeatureRulesTable<
    FeatureRules extends Rules[keyof Rules],
    Feature extends FeaturesEnum,
> = {
    [Rule in FeatureRules]: RuleMetadata<Feature, Rule>
}
