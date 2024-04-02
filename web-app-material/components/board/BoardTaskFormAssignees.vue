<template>
    <ul class="assignees-list">
        <li class="assignees-item tw-mb-2">
            <VMenu ref="menuUsers" :close-on-content-click="false">
                <template #activator="{ on }">
                    <VBtn
                        small
                        outlined
                        icon
                        color="grey lighten-2"
                        class="tw-text-sm tw-mr-2"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            :icon="icons.faPlus"
                            class="grey--text text--lighten-1"
                        ></FontAwesomeIcon>
                    </VBtn>
                    <span class="tw-text-xs">add assignee</span>
                </template>
                <div class="user-search-warp">
                    <FontAwesomeIcon
                        :icon="icons.faSearch"
                        class="grey--text text--lighten-1 tw-mr-2 tw-text-xs"
                    ></FontAwesomeIcon>
                    <input
                        v-model="searchUser"
                        class="user-search-input"
                        placeholder="Search users in the workspace"
                    />
                </div>
                <ul class="users-list">
                    <li
                        v-for="user in usersSearched"
                        :key="user.id"
                        class="users-item"
                        @click="
                            assigneeAddToList(user)
                            $refs.menuUsers.save()
                        "
                    >
                        <ProfileImage :user="user" :size="20" class="user-image" />
                        <div class="tw-flex-1 tw-text-xs">
                            {{ user.firstName }} {{ user.lastName }}
                        </div>
                    </li>
                </ul>
            </VMenu>
        </li>
        <li v-for="(assignee, index) in assigneesTemp" :key="index" class="assignees-item tw-mb-1">
            <ProfileImage :user="assignee" :size="28" class="tw-text-xs tw-mr-2" />
            <div class="tw-flex-1">
                <div class="tw-text-xs">{{ assignee.firstName }} {{ assignee.lastName }}</div>
                <div v-if="assignee.organizationName" class="tw-text-xs grey--text text--lighten-1">
                    {{ assignee.organizationName }}
                </div>
            </div>
            <VBtn
                small
                icon
                color="deep-orange accent-1"
                class="assignee-remove"
                @click="assigneeRemoveFromList(assignee)"
            >
                <FontAwesomeIcon :icon="icons.faTimes"></FontAwesomeIcon>
            </VBtn>
        </li>
    </ul>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext, ref, computed } from '@nuxtjs/composition-api'
import cloneDeep from 'lodash/cloneDeep'
import { faPlus, faTimes } from '@fortawesome/pro-solid-svg-icons'
import { faSearch } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '~/composables/common/useIcons'
import { User } from '~/sdk'

export default defineComponent({
    name: 'BoardTaskFormAssignees',
    props: {
        assignees: {
            type: Array as PropType<User[]>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { $accessor } = useContext()
        const { icons } = useIcons({ faPlus, faTimes, faSearch })

        const searchUser = ref('')
        const assigneesTemp = ref(cloneDeep(props.assignees))

        /* -- Computed -- */
        const usersList = computed(() => $accessor.iam.getUsers)
        const assigneesIds = computed(() => {
            return assigneesTemp.value.map((assignee) => {
                return assignee.id
            })
        })
        const usersUnassigned = computed(() => {
            return usersList.value.filter((user) => {
                return !assigneesIds.value.includes(user.id)
            })
        })
        const usersSearched = computed(() => {
            return usersUnassigned.value.filter((user) => {
                return (
                    user.firstName.toLowerCase().includes(searchUser.value.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(searchUser.value.toLowerCase())
                )
            })
        })

        /* -- Methods -- */
        function assigneeAddToList(assignee) {
            assigneesTemp.value.push(assignee)
            emit('assigneesUpdate', setAssigneesUpdate())
        }
        function assigneeRemoveFromList(assigneeToDelete) {
            assigneesTemp.value = assigneesTemp.value.filter((assignee) => {
                return assignee.id !== assigneeToDelete.id
            })
            emit('assigneesUpdate', setAssigneesUpdate())
        }
        function setAssigneesUpdate() {
            return assigneesTemp.value.map((assignee) => {
                return { id: assignee.id }
            })
        }

        return {
            icons,
            searchUser,
            assigneesTemp,
            usersList,
            usersSearched,
            assigneeAddToList,
            assigneeRemoveFromList,
        }
    },
})
</script>

<style scoped>
.assignees-list {
    list-style: none;
    padding-left: 0;
}

.assignees-item {
    display: flex;
    align-items: center;
}

.assignees-item:hover .assignee-remove {
    opacity: 1;
}

.assignee-remove {
    @apply tw-text-sm;
    opacity: 0;
}

.user-search-warp {
    display: flex;
    align-items: center;
    background-color: white;
    @apply tw-px-2 tw-py-1;
    border-bottom: 1px solid #e0e0e0;
}

.user-search-input {
    flex: 1;
    height: 22px;
    @apply tw-text-xs;
    border: none;
    outline: none;
}

.users-list {
    background-color: white;
    min-width: 200px;
    list-style: none;
    @apply tw-py-2 tw-pl-0;
}

.users-item {
    @apply tw-px-2 tw-py-1;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: 0.3s background-color ease;
}

.users-item:hover {
    background-color: #eee;
}

.user-image {
    font-size: 10px;
    @apply tw-mr-1.5;
}
</style>
