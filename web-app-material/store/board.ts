import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { APIRoutesV2 } from '~/types/typing'
import { Board } from '~/types/entities/Board.entity'
import { CreateBoardDto, CreateTaskDto, UpdateBoardDto, UpdateTaskDto } from '~/sdk'

export const state = () => ({
    board: {} as Board,
})

export const getters = getterTree(state, {
    getBoard(state): Board {
        return state.board
    },
})

export const mutations = mutationTree(state, {
    setBoard(state, payload: Board) {
        state.board = payload
    },
})

export const actions = actionTree(
    {
        state,
        getters,
        mutations,
    },
    {
        async fetchBoard({ commit }, { boardId }: { boardId: number }): Promise<any> {
            try {
                const response = await this.$axios.$get(APIRoutesV2.BOARDS_ID(boardId))
                commit('setBoard', response)
                return response
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async createBoard(_, boardData: CreateBoardDto): Promise<any> {
            try {
                return await this.$axios.$post(APIRoutesV2.BOARDS(), boardData)
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async updateBoard(
            _,
            { boardId, boardData }: { boardId: number; boardData: UpdateBoardDto }
        ): Promise<any> {
            try {
                return await this.$axios.$patch(APIRoutesV2.BOARDS_ID(boardId), boardData)
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async deleteBoard(_, boardId: number): Promise<any> {
            try {
                return await this.$axios.$delete(APIRoutesV2.BOARDS_ID(boardId))
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async createTask(_, taskData: CreateTaskDto): Promise<any> {
            try {
                return await this.$axios.$post(APIRoutesV2.TASKS(), taskData)
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async updateTask(
            _,
            { taskId, taskData }: { taskId: number; taskData: UpdateTaskDto }
        ): Promise<any> {
            try {
                return await this.$axios.$patch(APIRoutesV2.TASKS_ID(taskId), taskData)
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async deleteTask(_, taskId: number): Promise<any> {
            try {
                return await this.$axios.$delete(APIRoutesV2.TASKS_ID(taskId))
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async updateTaskUploads(
            _,
            { taskId, taskFile }: { taskId: number; taskFile: object }
        ): Promise<any> {
            try {
                return await this.$axios.$patch(APIRoutesV2.TASKS_ID_UPLOADS(taskId), taskFile)
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async deleteTaskUploads(
            _,
            { taskId, uploadId }: { taskId: number; uploadId: number }
        ): Promise<any> {
            try {
                return await this.$axios.$delete(APIRoutesV2.TASKS_ID_UPLOADS_ID(taskId, uploadId))
            } catch (error) {
                this.$logger.error(error)
            }
        },
    }
)
