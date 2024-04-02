<template>
    <VMenu offset-y>
        <template #activator="{ on, attrs }">
            <VTextField
                v-model="search"
                class="tw-mx-2 tw-mt-2"
                v-bind="attrs"
                label="Search users in the workspace"
                outlined
                hide-details="auto"
                dense
                v-on="on"
            />
        </template>
        <VList>
            <VListItem
                v-for="(user, index) in filteredUsers"
                :key="index"
                @click="$emit('input', user)"
            >
                <VListItemTitle>{{ user.firstName + ' ' + user.lastName }}</VListItemTitle>
            </VListItem>
        </VList>
    </VMenu>
</template>
<script lang="ts">
import {
    computed,
    defineComponent,
    PropType,
    ref,
    useContext,
    useFetch,
} from '@nuxtjs/composition-api'
import throttle from 'lodash/throttle'
import { APIRoutesV2 } from '~/types/typing'
import { User } from '~/types/entities/User.entity'

export default defineComponent({
    name: 'UploadUserSearch',
    props: {
        /**
         * Poster Authors
         */
        authors: {
            type: Array as PropType<User[]>,
            required: true,
        },
    },
    setup(props) {
        const { $axios, $accessor } = useContext()

        const _users = ref<User[]>([])
        const search = ref('')

        const _authorsHashTable = computed<Record<string, boolean>>(() => {
            const table = {}
            for (const author of props.authors) {
                table[author.id] = true
            }
            return table
        })

        const filteredUsers = computed(() => {
            return _users.value
                .filter((user) => !_authorsHashTable.value[user.id])
                .filter((user) => {
                    const loweredSearch = search.value.toLowerCase()
                    return (
                        user.firstName.toLowerCase().includes(loweredSearch) ||
                        user.lastName.toLowerCase().includes(loweredSearch)
                    )
                })
        })

        const _fetchUsers = throttle(async () => {
            _users.value = await $axios.$get(
                APIRoutesV2.WORKSPACES_ID_USERS($accessor.workspace.getWorkspaceId)
            )
        })

        useFetch(_fetchUsers)

        return {
            filteredUsers,
            search,
            _authorsHashTable,
        }
    },
})
</script>
