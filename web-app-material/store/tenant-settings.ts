import { ActionTree, GetterTree, MutationTree } from 'vuex/types'
import { RootState } from '~/store'
import { APIRoutes } from '~/types/typing'

// TODO: Type for settings
interface TenantSettings {}

const initialState = {
    settings: [] as TenantSettings[],
}

export const state = () => initialState

export type TenantSettingsState = ReturnType<typeof state>

export const mutations: MutationTree<TenantSettingsState> = {
    setSettings(state, payload: TenantSettings[]) {
        state.settings = payload
    },
}

export const actions: ActionTree<TenantSettingsState, RootState> = {
    async fetchSettings({ commit }) {
        // TODO: add axios
        const settings: TenantSettings[] = await this.$axios.$get(APIRoutes.IAM_USERS)
        commit('setSettings', settings)
    },

    async updateSettings(_, { settings, logo }: { settings: any; logo?: File }): Promise<any> {
        const formData = new FormData()
        formData.append('data', JSON.stringify(settings))
        if (logo) {
            formData.append('logo', logo, logo.name)
        }

        // TODO: add axios
        return await this.$axios.patch(APIRoutes.UPDATE_PROFILE, formData)
    },
}

export const getters: GetterTree<TenantSettingsState, RootState> = {
    getSettings(state) {
        return state.settings
    },
}
