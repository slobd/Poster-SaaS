<template>
    <VCard class="tw-h-full tw-p-4">
        <h3 class="tw-text-lg tw-mb-2">{{ title }}</h3>
        <VRow v-if="users.length">
            <VCol v-for="(user, i) in users" :key="i" cols="12" md="6">
                <UserCard :user="user" />
            </VCol>
        </VRow>
        <VCard v-else class="tw-w-1/2 tw-px-4 tw-py-10 tw-mx-auto tw-mt-10 tw-text-center">
            <h4 class="text-sm">There is no content to show right now.</h4>
        </VCard>
    </VCard>
</template>

<script lang="ts">
import { computed, defineComponent, useFetch, useRoute } from '@nuxtjs/composition-api'
import useExperts from '~/composables/experts/useExperts'

export default defineComponent({
    setup() {
        const route = useRoute()
        const userId = parseInt(route.value.params.userId, 10)
        const workspaceId = parseInt(route.value.params.workspaceId, 10)
        // Register composables
        const { users, fetchRelateExperts } = useExperts()
        // Hook
        useFetch(() => fetchRelateExperts(workspaceId, userId))

        // Computed
        const title = computed(() => 'RELATED PEOPLE')

        return {
            users,
            title,
        }
    },
})
</script>

<style></style>
