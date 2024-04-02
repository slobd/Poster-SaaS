type PartialIntegrations = Partial<{
    Amplitude: boolean
    'Google Analytics': boolean
    Matomo: boolean
}>

export type Integrations = { All: boolean } & PartialIntegrations

export interface Preferences {
    analytics: boolean
    marketing: boolean
}

export type IntegrationsPreferenceMap = {
    [key in keyof Preferences]: PartialIntegrations
}

export type CookiePreferences = Preferences | undefined

export type AskedForConsentCookie = boolean | undefined

export const COOKIE = {
    COOKIE_PREFERENCES: 'cookiePreferences',
    GUEST_WELCOME_ALERT: 'GuestWelcomeAlert',
}
