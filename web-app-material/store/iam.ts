import { actionTree, mutationTree, getterTree } from 'typed-vuex'
import axios from 'axios'
import { Role } from '~/types/entities/Role.entity'
import { User } from '~/sdk'
import { APIRoutes, APIRoutesV2 } from '~/types/typing'

import { Rule } from '~/types/entities/Rule.entity'

export interface RoleWithPermissions {
    id: number
    name: string
    description: string
}

// TODO: Import interface from sdk
export interface FindAllRulesDto {
    feature?: string

    name?: string

    subject?: string

    action?: string

    options?: any
}

const initialState = {
    /**
     * When the key changes it forces the UI to re-render and recognize the new rules
     * This is a provisional solution until we migrate to Vue 3 and can use the latest vue/casl plugin
     */
    key: '',
    users: [] as User[],
    roles: [] as RoleWithPermissions[],
    rules: [] as Rule[],
}

export const state = () => initialState

export type IamState = ReturnType<typeof state>

interface UpdateRoleOfUserPayload {
    index: number
    role: Role
}

export const mutations = mutationTree(state, {
    setUsers(state, payload: User[]) {
        state.users = payload
    },
    removeUser(state, id: number) {
        const index = state.users.findIndex((u) => u.id === id)
        if (index !== -1) state.users.splice(index, 1)
    },
    updateRoleOfUser(state, payload: UpdateRoleOfUserPayload) {
        state.users[payload.index].roles = [payload.role]
    },
    setRoles(state, payload: RoleWithPermissions[]) {
        state.roles = payload
    },
    setRules(state, payload: Rule[]) {
        state.rules = payload
    },
    appendRules(state, payload: Rule[]) {
        state.rules.push(...payload)
    },
    setKey(state, payload: string) {
        state.key = payload
    },
})

export const actions = actionTree(
    { state },
    {
        async fetchUsers({ commit }, { workspaceId }: { workspaceId: number }): Promise<any> {
            try {
                const result = await this.$axios.$get(APIRoutesV2.WORKSPACES_ID_USERS(workspaceId))
                commit('setUsers', result)
            } catch (error: any) {
                this.$accessor.banner.setBanner({
                    type: 'error',
                    message: error.message,
                    value: true,
                })
            }
        },
        async updateWorkspaceUserRole(
            _,
            { workspaceId, userId, data }: { workspaceId: number; userId: number; data: object }
        ): Promise<any> {
            try {
                const result = await this.$axios.$patch(
                    APIRoutesV2.WORKSPACES_ID_USERS_ID(workspaceId, userId),
                    data
                )

                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'success',
                    message: 'User role is successfully changed!',
                })

                return result
            } catch (e) {
                if (axios.isAxiosError(e)) {
                    this.$accessor.banner.setError(e.message)
                }
            }
        },
        async deleteWorkspaceUser(
            { commit },
            { workspaceId, userId }: { workspaceId: number; userId: number }
        ): Promise<any> {
            try {
                await this.$axios.$delete(APIRoutesV2.WORKSPACES_ID_USERS_ID(workspaceId, userId))

                commit('removeUser', userId)
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    this.$accessor.banner.setError(
                        'There was an error while removing the user from the workspace'
                    )
                }
            }
        },
        async fetchRoles({ commit }, domain: string) {
            const roles: Role[] = await this.$axios.$get(APIRoutes.ACCESS_CONTROL__ROLES, {
                params: {
                    domain,
                },
            })
            commit('setRoles', roles)
        },
        async fetchAllUserRules({ commit, state }) {
            try {
                const rules: Rule[] = await this.$axios.$get(
                    APIRoutes.ACCESS_CONTROL__USERS__ME__RULES
                )
                commit('setRules', rules)
                this.$ability.update(state.rules)
                commit('setKey', JSON.stringify(state.rules))
            } catch (e) {
                this.$logger.error(e)
            }
        },
        async fetchRules({ commit, state }, payload: FindAllRulesDto) {
            const rules: Rule[] = await this.$axios.$get(
                APIRoutes.ACCESS_CONTROL__USERS__ME__RULES,
                {
                    params: payload,
                }
            )
            commit('appendRules', rules)
            this.$ability.update(state.rules)
            commit('setKey', JSON.stringify(state.rules))
        },
    }
)

export const getters = getterTree(state, {
    getUsers(state): User[] {
        return state.users
    },
    getRoles(state) {
        return state.roles
    },
    getRules(state) {
        return state.rules
    },
    getRolesNames(state) {
        return state.roles.map(({ name }) => name)
    },
})
