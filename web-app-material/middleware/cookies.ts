import { Context } from '@nuxt/types'
import { COOKIE, CookiePreferences } from '~/types/cookies'

/**
 * We use this middleware to update the store based on the askedForConsent and givenConsents cookies.
 * Once we retrieved then once the is no need to called the middleware again
 */
export default ({ app, store }: Context) => {
    // TODO: Research what happens when cookies expires.

    // Only execute middleware if it wasn't executed before
    if (!store.state.cookies.calledCookieMiddleware) {
        // Cookie Preferences is use to know if the user gave some consents before
        const cookiePreferences: CookiePreferences = app.$cookies.get(COOKIE.COOKIE_PREFERENCES)
        const thereIsACookie = cookiePreferences !== undefined

        if (thereIsACookie) {
            store.commit('cookies/setPreferences', cookiePreferences)
            // Automatically activate Analytics
            store.commit('cookies/setBootstrap', true)
        } else {
            store.commit('cookies/setShowBanner', true)
        }

        // Execute this middleware only once
        store.commit('cookies/setCalledCookieMiddleware', true)
    }
}
