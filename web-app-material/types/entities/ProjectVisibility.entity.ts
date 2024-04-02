export enum ProjectVisibilityEnum {
    // Auth and non-auth users can see all the information about the project
    PUBLIC = 'PUBLIC',

    // Only Auth users with the needed rights can see the project
    PRIVATE = 'PRIVATE',
}

export interface ProjectVisibility {
    name: ProjectVisibilityEnum
}
