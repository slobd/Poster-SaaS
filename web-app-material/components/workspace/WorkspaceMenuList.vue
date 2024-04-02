<template>
    <VCard class="mx-auto">
        <VList>
            <VListItem v-if="$can('update', caslWorkspace)" @click="clickUpdateWorkspace()">
                <VListItemTitle class="tw-font-bold"> Workspace Settings</VListItemTitle>
            </VListItem>
            <VListItem
                v-if="$can('update', caslUser)"
                :to="`/workspace/${workspace.id}/user-management`"
            >
                <VListItemTitle class="tw-font-bold">User Management</VListItemTitle>
            </VListItem>
            <VListItem @click="clickDeleteWorkspace()">
                <VListItemTitle class="tw-font-bold">Delete Workspace</VListItemTitle>
            </VListItem>
        </VList>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, computed, useContext } from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'

export default defineComponent({
    name: 'WorkspaceMenuList',
    props: {
        workspace: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const { $accessor } = useContext()

        const caslWorkspace = computed(() => {
            return subject('Workspace', { ...$accessor.workspace.getDefaultWorkspace })
        })
        const caslUser = computed(() =>
            subject('User', {
                roles: {
                    role: {
                        domain: `Workspace/${$accessor.workspace.getWorkspaceId}`,
                    },
                },
            })
        )

        function clickUpdateWorkspace() {
            $accessor.workspace.setDefaultWorkspace(props.workspace)
            $accessor.workspace.setCreateWorkspaceModal({
                newWorkspace: false,
                status: true,
            })
        }

        async function clickDeleteWorkspace() {
            await $accessor.workspace.fetchWorkspace({ id: props.workspace.id })
            $accessor.workspace.setDeleteWorkspaceModal(true)
        }

        return {
            caslWorkspace,
            caslUser,
            clickUpdateWorkspace,
            clickDeleteWorkspace,
        }
    },
})
</script>
