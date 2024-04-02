<template>
    <div data-cy="SearchUser">
        <p class="tw-py-4 tw-m-0 tw-text-xxs">Search users</p>

        <CanvasDropdown title="Share">
            <template #button="{ click }">
                <VTextField
                    placeholder="Search by name"
                    autocomplete="off"
                    outlined
                    dense
                    class="tw-w-full tw-m-0"
                    name="search"
                    :value="search"
                    @click="click"
                    @input="(value) => filterUsers(value)"
                />
            </template>
            <template #content>
                <div
                    v-if="filteredUsers && filteredUsers.length"
                    class="tw-overflow-auto tw-rounded-lg tw-border tw-border-gray-200"
                    style="max-height: 12rem"
                >
                    <div
                        v-for="(user, index) in filteredUsers"
                        :key="`author ${index}`"
                        class="
                            tw-px-2 tw-flex tw-flex-row tw-justify-between tw-items-center tw-py-2
                            hover:tw-bg-gray-200
                            tw-cursor-pointer
                        "
                        @click.prevent="handleUserClick(user.email)"
                    >
                        <div class="tw-flex tw-items-center tw-space-x-2 lg:tw-space-x-2">
                            <CanvasProfileImage :user="user" :size="eVProfileImageSize.sm" />
                            <div>
                                <p class="tw-font-medium tw-text-xs tw-m-0">
                                    <span> {{ user.firstName }} {{ user.lastName }} </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </CanvasDropdown>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { User } from '~/types/entities/User.entity'
import { APIRoutes } from '~/types/typing'
import { EVProfileImageSize } from '~/components/canvas/CanvasProfileImage.vue'

export default Vue.extend({
    name: 'SearchUser',
    props: {
        usersToFilter: {
            type: Array as () => Array<User>,
            default: () => [],
        },
    },
    data() {
        return {
            users: [] as User[],
            filteredUsers: [] as User[],
            search: '',
            open: false,
            eVProfileImageSize: EVProfileImageSize,
        }
    },
    async fetch(): Promise<void> {
        try {
            const users = await this.$axios.$get(APIRoutes.IAM_USERS)
            // Remove user that are present in store
            this.users = users.filter(
                ({ email }) => !this.usersToFilter.some((author) => email === author.email)
            )

            this.filteredUsers = [...this.users]
        } catch (error) {
            console.error('[Error:SearchUser]fetch:', error.message)
        }
    },
    // Avoid this.$fetch is not a function error on client
    fetchOnServer: true,
    watch: {
        usersToFilter: {
            async handler(): Promise<void> {
                if (this.$fetch) await this.$fetch()
            },
            deep: true,
            immediate: true,
        },
        '$route.query': '$fetch',
    },
    methods: {
        handleUserClick(email: string): void {
            const user = this.users.find((user) => user.email === email)

            this.$emit('user', user)
        },
        filterUsers(value: string): void {
            this.filteredUsers = this.users.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(value.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(value.toLowerCase())
            )
        },
    },
})
</script>
