import { TenantFeatures } from './tenant-features.entity'

export interface TenantSuperadmin {
    firstName: string
    lastName: string
    email: string
    password?: string
}

export interface TenantThemeCSS {
    primaryColor: string
    secondaryColor: string
    tertiaryColor: string
}

export interface TenantThemeImages {
    primaryLogo: any
    secondaryLogo?: any
    primaryLogoClasses?: string
    secondaryLogoClasses?: string
    authLayoutBackground: any
}

export interface TenantThemeInformation {
    contactSupportUrl: string
    imprintUrl: string
    privacyPolicyUrl: string
}

interface IndexPage {
    title: string
    body: string
    image: any
}

interface ProfileUploadPosterCard {
    title: string
    body: string
}

interface HomePageText {
    title: string
    body: string
}

export interface TenantThemeAppContent {
    backToHomeButtonText: string
    registerButtonText: string
    appTopBarText: string
    galleryUploadButtonText: string
    uploadDocumentPageText: string
    indexPage: IndexPage
    profileUploadPosterCard: ProfileUploadPosterCard
    homePageText: HomePageText
    autocompleteTopics: { text: string }[]
}

export interface TenantSettings {
    everyoneCanEditOnlineSessionLink: boolean
    galleryPublicVisibility: boolean
    galleryOrganizationVisibility: boolean
    showWorkspace: boolean
}

export interface TenantTheme {
    id: number
    tenantId: string
    name: string
    defaultURL: string
    customURL: string
    superadmin: TenantSuperadmin
    css: TenantThemeCSS
    images: TenantThemeImages
    information: TenantThemeInformation
    appContent: TenantThemeAppContent
    features: TenantFeatures
    settings: TenantSettings
}
