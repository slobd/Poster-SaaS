export enum WorkspaceVisibilityEnum {
    // Auth and non-auth users can see all the information about the workspace
    ORGANIZATION = 'PUBLIC',

    // Only Auth users with the needed rights can see the workspace
    PRIVATE = 'PRIVATE',
}

export interface WorkspaceVisibility {
    name: WorkspaceVisibilityEnum
}
