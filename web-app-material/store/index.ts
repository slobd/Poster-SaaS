import { getAccessorType, actionTree, mutationTree, getterTree } from 'typed-vuex'
import { Context } from '@nuxt/types'
import { Auth } from '@nuxtjs/auth-next'
import { TenantState } from './tenant'

import * as iamModule from '~/store/iam'
import * as canvasModule from '~/store/canvas'
import * as galleryModule from '~/store/gallery'
import * as tenantModule from '~/store/tenant'
import * as bannerModule from '~/store/banner'
import * as myprofileModule from '~/store/myprofile'
import * as CommentModule from '~/store/comments'
import * as WorkspaceModule from '~/store/workspace'
import * as ProjectModule from '~/store/project'
import * as BoardModule from '~/store/board'

export const state = () => ({
    posterUploadState: {
        loading: false,
        error: false,
        posterId: null,
    },

    // Send the user to right route after login
    afterLoginPath: '',
    currentLiveSession: '',
    // enable or disable invite modal
    inviteModal: false,
})

type ExtendedRootState = {
    auth: Auth
    tenant: TenantState
}

export type RootState = ReturnType<typeof state> & ExtendedRootState

export const getters = getterTree(state, {
    getPosterUploadState(state) {
        return state.posterUploadState
    },
    getAfterLoginPath(state) {
        return state.afterLoginPath || localStorage.getItem('afterLoginPath')
    },
    getCurrentLiveSession(state) {
        return state.currentLiveSession
    },
    getInviteModal(state) {
        return state.inviteModal
    },
})

export const mutations = mutationTree(state, {
    setPosterUploadState(
        state,
        payload: { error?: string | boolean; loading?: boolean; posterId?: number | null }
    ) {
        for (const key in payload) {
            state.posterUploadState[key] = payload[key]
        }
    },
    setAfterLoginPath(state, path: string) {
        state.afterLoginPath = path
        // Persist afterLoginPath over session
        localStorage.setItem('afterLoginPath', path)
    },
    setCurrentLiveSession(state, sessionName) {
        state.currentLiveSession = sessionName
    },
    setInviteModal(state, payload: boolean) {
        state.inviteModal = payload
    },
})

export const actions = actionTree(
    { state, getters, mutations },
    {
        async nuxtServerInit(_, { req, app }: Context) {
            try {
                if (req.headers.host === new URL(process.env.CLIENT_URL as string).host) return

                app.$axios.setHeader('origin', req.headers.host)
                /**
                 * the Id of the tenant should be gotten using a getter
                 * so that the name of the action is not confusing.
                 */
                const tenant = await app.$accessor.tenant.fetchTenant()

                if (tenant) {
                    app.$axios.setHeader('x-tenant', tenant.toString())
                }
                if (!app.$accessor.workspace.getWorkspaceId && app.$auth.loggedIn) {
                    app.$accessor.workspace.setWorkspaceId(app.$auth.user.workspaces[0].id)
                }
            } catch (e) {
                console.log('nuxtServerInit failed: ', e)
            }
        },
    }
)

export const accessorType = getAccessorType({
    state,
    getters,
    mutations,
    actions,
    modules: {
        // The key (submodule) needs to match the Nuxt namespace (e.g. ~/store/submodule.ts)
        iam: iamModule,
        canvas: canvasModule,
        tenant: tenantModule,
        gallery: galleryModule,
        banner: bannerModule,
        myprofile: myprofileModule,
        comments: CommentModule,
        project: ProjectModule,
        workspace: WorkspaceModule,
        board: BoardModule,
    },
})

export type Accessor = typeof accessorType
