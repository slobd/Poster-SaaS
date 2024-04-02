import { actionTree, getterTree } from 'typed-vuex'
import { User } from '~/types/entities/User.entity'
import { APIRoutesV2 } from '~/types/typing'

export const state = () => ({})

export type MyProfileState = ReturnType<typeof state>

export const getters = getterTree(state, {
    getCurrentRole(_state, _getters, rootState) {
        const user = rootState.auth.user as User

        const tenantId = rootState.tenant.tenantId

        return user.roles && user.roles.find((role) => role.tenantId === tenantId)
    },
})

export const actions = actionTree(
    { state, getters },
    {
        resetUserManagementState({ commit }) {
            commit('resetState')
        },
        async updateProfile(_, { user, avatar }: { user: User; avatar?: File }): Promise<any> {
            const formData = new FormData()
            formData.append('data', JSON.stringify(user))
            if (avatar) {
                formData.append('avatar', avatar, avatar.name)
            }
            return await this.$axios.patch(APIRoutesV2.AUTH_USERS_PROFILES(), formData)
        },
    }
)
