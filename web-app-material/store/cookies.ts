import { ActionTree, MutationTree, GetterTree } from 'vuex/types'
import { RootState } from '.'
import {
    COOKIE,
    CookiePreferences,
    Integrations,
    IntegrationsPreferenceMap,
    Preferences,
} from '~/types/cookies'

export const state = () => ({
    /**
     * Used to prevent calling executing the cookie middleware more than once
     */
    calledCookieMiddleware: false,
    /**
     * Should automatically load analytics.js
     */
    bootstrap: false,
    /**
     * Both are use to show or hide UI components
     */
    ui: {
        showBanner: false, // Cookie Banner is active or not
        showModal: false, // Cookie Modal is active or not
    },
    /**
     * Information about the consents given by the user.
     * Gotten from the cookies on init and can be change by the user later
     */
    preferences: {
        analytics: false,
        marketing: true,
    } as Preferences,
})

export type CookiesState = ReturnType<typeof state>

export const mutations: MutationTree<CookiesState> = {
    setPreferences(state, payload: Preferences) {
        state.preferences = payload
    },

    setShowBanner(state, payload: boolean) {
        state.ui.showBanner = payload
    },

    setShowModal(state, payload: boolean) {
        state.ui.showModal = payload
    },

    setCalledCookieMiddleware(state, payload: boolean) {
        state.calledCookieMiddleware = payload
    },

    setBootstrap(state, payload: boolean) {
        state.bootstrap = payload
    },
}

export const actions: ActionTree<CookiesState, RootState> = {
    acceptAll({ dispatch, commit }) {
        const preferences: Preferences = {
            analytics: true,
            marketing: true,
        }

        commit('setPreferences', preferences)

        dispatch('save')
    },

    save({ dispatch, commit, state }) {
        // Get old cookie before saving new one
        const cookiePreferences: CookiePreferences = this.$cookies.get(COOKIE.COOKIE_PREFERENCES)
        const thereIsACookie = cookiePreferences !== undefined

        // Save new preferences in the cookie
        const MAX_AGE = 183 * 24 * 60 * 60 // Half a year
        this.$cookies.set(COOKIE.COOKIE_PREFERENCES, state.preferences, {
            maxAge: MAX_AGE,
        })

        if (thereIsACookie) {
            // Reload the page
            this.$router.go(0)
        } else {
            dispatch('enableAnalytics')
        }

        commit('setShowBanner', false)
        commit('setShowModal', false)
    },

    enableAnalytics({ commit, getters }) {
        this.$segment.load(process.env.segmentKey, {
            integrations: getters.getIntegrations,
        })
        commit('setBootstrap', false)
    },
}

export const getters: GetterTree<CookiesState, RootState> = {
    getIntegrations(state) {
        let integrations: Integrations = {
            All: state.preferences.analytics && state.preferences.marketing,
        }

        if (integrations.All) {
            return integrations
        }

        const integrationsPreferenceMap: IntegrationsPreferenceMap = {
            analytics: {
                Amplitude: true,
                'Google Analytics': true,
                Matomo: true,
            },
            marketing: {},
        }

        for (const key in state.preferences) {
            if (state.preferences[key]) {
                integrations = {
                    ...integrations,
                    ...integrationsPreferenceMap[key],
                }
            }
        }

        return integrations
    },

    getPreferences(state) {
        return state.preferences
    },

    getShowBanner(state) {
        return state.ui.showBanner
    },

    getShowModal(state) {
        return state.ui.showModal
    },
}
