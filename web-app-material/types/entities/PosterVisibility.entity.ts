export enum PosterVisibilityEnum {
    // Auth and non-auth users can see all the information about the poster
    PUBLIC = 'PUBLIC',

    // Only Auth users with the needed rights can see the poster
    PRIVATE = 'PRIVATE',
}

export interface PosterVisibility {
    name: PosterVisibilityEnum
}
