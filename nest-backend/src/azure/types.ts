export interface AzureUser {
    objectId: any
    firstName: any
    lastName: any
    email: string
    password: string
    privacyPolicy: boolean
    termOfUse: boolean
}

export enum AzureRedirect {
    SIGNUP_SIGNIN = 'SIGNUP_SIGNIN',
    SIGNUP_ONLY = 'SIGNIN_ONLY',
    PASSWORD_RESET = 'PASSWORD_RESET',
}
