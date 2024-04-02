<template>
    <div class="workspace-home-wrapper">
        <WebMetadata />
        <VCard class="tw-w-1/2 tw-mx-auto tw-py-10">
            <div class="tw-w-1/2 tw-mx-auto text-center">
                <h4 class="text-h4 tw-pb-4">{{ workspaceName }}</h4>
                <p>{{ workspaceDescription }}</p>
            </div>
        </VCard>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, useFetch, useContext, useRoute } from '@nuxtjs/composition-api'
import { onMounted } from '@vue/composition-api'
import useWorkspace from '~/composables/workspace/useWorkspace'

export default defineComponent({
    name: 'WorkspaceHome',
    auth: false,
    setup() {
        const { $accessor } = useContext()
        const { fetchWorkspace } = useWorkspace()
        const $route = useRoute()
        useFetch(async () => {
            await fetchWorkspace()
        })

        onMounted(async () => {
            await $accessor.iam.fetchRoles(`Workspace/${$route.value.params.workspaceId}`)
        })

        const workspaceName = computed(() => $accessor.workspace.getDefaultWorkspace?.name)
        const workspaceDescription = computed(
            () => $accessor.workspace.getDefaultWorkspace?.description
        )
        return {
            workspaceName,
            workspaceDescription,
        }
    },
})
</script>

<style scoped>
.workspace-home-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(218deg, rgb(48, 41, 118) 0%, rgb(46, 182, 194) 100%);
    height: 100%;
}
</style>
