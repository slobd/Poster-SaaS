import { actionTree, getterTree, mutationTree } from 'typed-vuex'

type BannerType = 'default' | 'success' | 'error'

export const state = () => ({
    banner: {
        type: 'default' as BannerType,
        message: '',
        buttonText: '',
        value: false,
        to: '',
        href: '',
    },
})

export const getters = getterTree(state, {
    getBanner(state) {
        return state.banner
    },
})

interface ISetBannerPayload {
    value: boolean
    type?: BannerType
    message?: string
    href?: string
    to?: string
    buttonText?: string
}

export const mutations = mutationTree(state, {
    setBanner(state, payload: ISetBannerPayload) {
        const { value, type, message = '', href = '', to = '', buttonText = '' } = payload

        state.banner.value = value
        if (type) state.banner.type = type
        state.banner.message = message
        state.banner.href = href
        state.banner.to = to
        state.banner.buttonText = buttonText
    },
})

interface ISetBannerWithTimeoutPayload extends ISetBannerPayload {
    timeout?: number
}

export const actions = actionTree(
    { state, getters, mutations },
    {
        setBannerWithTimeout({ commit }, payload: ISetBannerWithTimeoutPayload) {
            const {
                value,
                type,
                message = '',
                href = '',
                to = '',
                buttonText = '',
                timeout = 5000,
            } = payload

            commit('setBanner', {
                value,
                type,
                message,
                href,
                to,
                buttonText,
            })
            if (value) {
                setTimeout(() => {
                    commit('setBanner', {
                        value: false,
                    })
                }, timeout)
            }
        },
        setError({ dispatch }, message: string) {
            dispatch('setBannerWithTimeout', {
                value: true,
                type: 'error',
                message,
            })
        },
    }
)
