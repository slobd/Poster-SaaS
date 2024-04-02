<template>
    <VCol class="tasks-col tw-px-4">
        <div class="tw-flex tw-items-center tw-pb-4">
            <div class="column-name tw-text-sm">{{ boardStatus.name }}</div>
            <VBtn small icon color="primary" class="tw-text-sm" @click="toggleNewTask()">
                <FontAwesomeIcon :icon="icons.faPlus" class="task-add-icon"></FontAwesomeIcon>
            </VBtn>
        </div>

        <BoardTaskCardNew
            v-if="isNewVisible"
            @close="toggleNewTask()"
            @addTask="addNewTask($event, boardStatus.id)"
        />

        <div :id="boardStatus.id" :ref="boardStatus.id" class="tw-h-full">
            <BoardTaskCard
                v-for="(card, cardIndex) in tasksInStatus"
                :key="cardIndex"
                :current-task="card"
                @refreshBoard="$emit('refreshBoard')"
            />
        </div>
    </VCol>
</template>

<script lang="ts">
import { defineComponent, ref, computed, useContext } from '@nuxtjs/composition-api'
import Sortable from 'sortablejs'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'
import { ProjectTaskItem } from '~/types/projectTasks'
import { CreateTaskDto, UpdateTaskDto } from '~/sdk'

export default defineComponent({
    name: 'TaskBoardStatus',
    props: {
        boardStatus: {
            type: Object,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { icons } = useIcons({ faPlus })
        const { $accessor } = useContext()

        const sortableOptions = {
            group: 'tasks',
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: async (event) => {
                await updateTask(event)
                emit('refreshBoard')
            },
        }

        const sortableColumn = ref()
        const isNewVisible = ref(false)

        /* -- Computed -- */
        const currentProject = computed(() => $accessor.project.getProject)
        const currentBoard = computed(() => $accessor.board.getBoard)
        const tasksInStatus = computed(() => {
            return sortedTaskCards(filteredTaskCards(props.boardStatus.id))
        })

        /* -- Methods -- */
        // API actions
        async function addNewTask(newTaskName: string, statusId: number) {
            const taskData = {
                title: newTaskName,
                description: '',
                statusId,
                board: {
                    id: currentBoard.value.id,
                    project: {
                        workspaceId: currentProject.value.workspaceId,
                        visibility: currentProject.value.visibility,
                    },
                    tenantId: $accessor.tenant.getTenantId,
                },
            } as CreateTaskDto
            await $accessor.board.createTask(taskData)
            toggleNewTask()
            emit('refreshBoard')
        }

        async function updateTask(event) {
            const taskId = getTaskById(event.item.id).id
            const taskData = {
                positionByStatus: setTaskPosition(event),
                statusId: parseInt(event.item.parentElement.id),
            } as UpdateTaskDto
            await $accessor.board.updateTask({ taskId, taskData })
        }

        // setters
        function filteredTaskCards(statusId: number): ProjectTaskItem[] {
            return $accessor.board.getBoard.tasks.filter((task) => {
                return task.status.id === statusId
            })
        }

        function sortedTaskCards(tasksList: ProjectTaskItem[]) {
            return tasksList.sort((taskA, taskB) => {
                return parseInt(taskA.positionByStatus) - parseInt(taskB.positionByStatus)
            })
        }

        function setTaskPosition(event): number {
            const nextTaskId = event.item.nextElementSibling
                ? parseInt(event.item.nextElementSibling.id)
                : null
            const previousTaskId = event.item.previousElementSibling
                ? parseInt(event.item.previousElementSibling.id)
                : null
            if (!nextTaskId && previousTaskId) {
                return parseInt(getTaskById(previousTaskId).positionByStatus) + 1000
            } else if (nextTaskId && !previousTaskId) {
                return parseInt(getTaskById(nextTaskId).positionByStatus) - 1000
            } else if (nextTaskId && previousTaskId) {
                const previousTaskPosition = parseInt(getTaskById(previousTaskId).positionByStatus)
                const nextTaskPosition = parseInt(getTaskById(nextTaskId).positionByStatus)
                return (nextTaskPosition - previousTaskPosition) / 2 + previousTaskPosition
            } else {
                return 0
            }
        }

        // utilities
        function toggleNewTask() {
            isNewVisible.value = !isNewVisible.value
        }
        function getTaskById(taskId: number): ProjectTaskItem {
            return currentBoard.value.tasks.filter((task) => {
                return task.id.toString() === taskId.toString()
            })[0]
        }

        return {
            icons,
            sortableOptions,
            sortableColumn,
            isNewVisible,
            currentProject,
            currentBoard,
            tasksInStatus,
            addNewTask,
            updateTask,
            toggleNewTask,
        }
    },
    mounted() {
        // on Vue 2 keep outside of composition API because of the problems with dynamic $refs in setup()
        // (according to some docs it is solved in Vue 3)
        this.sortableColumn = new Sortable(
            Object.values(this.$refs)[0] as HTMLElement,
            this.sortableOptions
        )
    },
})
</script>

<style scoped>
.tasks-col {
    max-width: 270px;
}

.column-name {
    flex: 1;
    font-weight: 500;
    text-transform: uppercase;
}
</style>
