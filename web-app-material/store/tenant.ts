import { actionTree, mutationTree, getterTree } from 'typed-vuex'
import { APIRoutes } from '~/types/typing'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'
import { User } from '~/types/entities/User.entity'

interface VisibilityOption {
    value: PosterVisibilityEnum
    label: string
}

// theme
const theme = {
    posterlab: false,
    name: 'PosterLab',
    images: {
        primaryLogo: 'PosterLabLogo.svg' as any,
    },
    css: {
        primaryColor: '#1C2268',
        secondaryColor: '#43b7b6',
    },
}

export type TenantTheme = typeof theme

export const state = () => ({
    theme,
    tenantId: null as number | null,
    tenantName: '',
    tenantFeatures: {
        AccessControl: false,
        TenantManagement: false,
    },
    host: '',
    superadmin: {} as User,
})

export type TenantState = ReturnType<typeof state>

export const getters = getterTree(state, {
    getTheme(state): TenantTheme {
        return state.theme
    },
    getSuperadmin(state): User {
        return state.superadmin
    },
    getTenantId(state): number | null {
        return state.tenantId
    },
    getVisibilityOptions(_state, _getters, rootState) {
        const visibilityOptions: VisibilityOption[] = []

        visibilityOptions.push({
            value: PosterVisibilityEnum.PUBLIC,
            label: 'Public',
        })

        if (rootState.auth.loggedIn) {
            visibilityOptions.push({
                value: PosterVisibilityEnum.PRIVATE,
                label: 'Only me (private)',
            })
        }
        return visibilityOptions
    },
    getTenantName(state): string {
        return state.tenantName
    },
    getHost(state): string {
        return state.host
    },
    getTenantFeatures(state) {
        return state.tenantFeatures
    },
})

export const mutations = mutationTree(state, {
    setTheme(state, payload: TenantState['theme']) {
        state.theme = payload
    },
    setSuperadmin(state, payload: User) {
        state.superadmin = payload
    },
    setTenantId(state, payload: TenantState['tenantId']) {
        state.tenantId = payload
    },
    setTenantName(state, payload: TenantState['tenantName']) {
        state.tenantName = payload
    },
    setHost(state, host: TenantState['host']) {
        state.host = host
    },
    setTenantFeatures(state, payload: TenantState['tenantFeatures']) {
        state.tenantFeatures = payload
    },
})

export const actions = actionTree(
    { state, getters, mutations },
    {
        async fetchTenant({ commit }): Promise<number | undefined> {
            try {
                const tenant = await this.$axios.$get(APIRoutes.TENANT_BY_ORIGIN)

                const theme: TenantState['theme'] = {
                    posterlab: false,
                    name: tenant.name,
                    images: tenant.theme.images,
                    css: {
                        primaryColor: '#1C2268',
                        secondaryColor: '#43b7b6',
                    },
                }
                if (tenant?.logo) theme.images.primaryLogo = tenant.logo

                const tenantName: TenantState['tenantName'] = tenant.name
                commit('setTenantId', tenant.id)
                commit('setTheme', theme)
                commit('setTenantName', tenantName)
                commit('setHost', tenant.host)
                commit('setTenantFeatures', tenant.theme.features)
                commit('setSuperadmin', tenant.theme.superadmin)

                return tenant.id
            } catch (error) {
                this.$logger.error('[Error.store.tenant]fetchTenant ', error)
                // TODO: If this method fails. The app should shown an error
                this.app.$accessor.banner.setBanner(
                    {
                        value: true,
                        type: 'error',
                        message:
                            'There was a problem detecting the organization this page belongs to',
                    },
                    {
                        root: true,
                    }
                )
            }
        },
    }
)
