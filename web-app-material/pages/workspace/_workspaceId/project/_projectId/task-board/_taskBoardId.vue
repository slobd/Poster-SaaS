<template>
    <VContainer fluid class="tw-px-8 tw-pt-6">
        <VRow v-if="currentBoard.statuses && !reRender">
            <BoardTaskStatus
                v-for="status in currentBoard.statuses"
                :key="status.id"
                ref="tasksRefs"
                :board-status="status"
                @refreshBoard="reRenderBoard()"
            />
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    computed,
    useContext,
    useRoute,
    onUnmounted,
} from '@nuxtjs/composition-api'
import { Board } from '~/types/entities/Board.entity'

export default defineComponent({
    name: 'TaskBoardId',
    setup() {
        const { $accessor } = useContext()
        const $route = useRoute()

        const reRender = ref(false)

        /* -- Computed -- */
        const currentProject = computed(() => $accessor.project.getProject)
        const currentBoard = computed(() => $accessor.board.getBoard)

        /* -- Methods -- */
        // API actions
        async function fetchBoard() {
            await $accessor.board.fetchBoard({
                boardId: parseInt($route.value.params.taskBoardId),
            })
        }
        async function fetchUsers() {
            await $accessor.iam.fetchUsers({
                workspaceId: parseInt($route.value.params.workspaceId),
            })
        }

        async function reRenderBoard() {
            reRender.value = true
            await fetchBoard()
            reRender.value = false
        }

        // lifecycle hooks
        onUnmounted(() => {
            // to prevent flicker of the old data (from previous board)
            $accessor.board.setBoard({} as Board)
        })

        return {
            reRender,
            currentProject,
            currentBoard,
            fetchBoard,
            fetchUsers,
            reRenderBoard,
        }
    },
    async created() {
        await this.fetchBoard()
        await this.fetchUsers()
    },
})
</script>
