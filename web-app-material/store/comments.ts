import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { Comment } from '@/types/entities/Comment.entity'
import { NotificationState } from '~/types/comments'
import { APIRoutesV2 } from '~/types/typing'

export enum CommentStoreUrls {
    GET_COMMENT = 'comments/getComment',
    GET_COMMENTS = 'comments/getComments',
    SET_COMMENTS = 'comments/setComments',
    ADD_COMMENT = 'comments/addComment',
    REMOVE_COMMENT = 'comments/removeComment',
}

export const state = () => ({
    comments: [] as Comment[],
    notification: { state: NotificationState.NONE, content: '' },
})

export type CommentsState = ReturnType<typeof state>

export const getters = getterTree(state, {
    getComments: (state) => state.comments,
    getNotification: (state) => state.notification,
})

export const mutations = mutationTree(state, {
    setNotification(state, payload: { state?: NotificationState; content?: string }) {
        if (payload.state) state.notification.state = payload.state
        if (payload.content) state.notification.content = payload.content
    },
    setComments(state, payload: Comment[]) {
        state.comments = payload
    },
    addComment(state, payload: Comment) {
        state.comments.unshift(payload)
    },
    removeComment(state, id: number) {
        state.comments = state.comments.filter((comment) => comment.id !== id)
    },
})

export const actions = actionTree(
    { state },
    {
        async fetchComments({ commit }, payload) {
            const { posterId } = payload
            const comments = await this.$axios.$get(APIRoutesV2.POSTERS_ID_COMMENTS(posterId))
            commit('setComments', comments)
        },
    }
)
