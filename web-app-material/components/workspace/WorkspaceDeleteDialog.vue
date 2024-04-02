<template>
    <VDialog v-model="$accessor.workspace.deleteWorkspaceModal" width="500">
        <template #activator="{ on, attrs }">
            <slot name="activator" v-bind="{ on, attrs }"></slot>
        </template>

        <VCard>
            <VCardTitle class="text-h5 grey lighten-2">
                Are you sure you want to delete this item?
            </VCardTitle>

            <VCardText class="tw-flex tw-flex-col tw-items-center tw-space-y-4 tw-pt-5">
                <FontAwesomeIcon :icon="icons.faExclamationCircle" class="error--text" size="6x" />
                <div class="text-h5 tw-text-center">
                    All associated data will be deleted too! You can't undo this
                </div>
            </VCardText>

            <VDivider />

            <VCardActions>
                <VSpacer />
                <VBtn
                    color="primary"
                    text
                    @click="$accessor.workspace.setDeleteWorkspaceModal(false)"
                >
                    Cancel
                </VBtn>
                <VBtn color="error" @click="confirmDelete"> Delete </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script lang="ts">
import { defineComponent, useContext } from '@nuxtjs/composition-api'
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons'
import useWorkspace from '~/composables/workspace/useWorkspace'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'WorkspaceDeleteDialog',
    setup() {
        const { icons } = useIcons({
            faExclamationCircle,
        })
        const { $accessor } = useContext()
        const { deleteWorkspace } = useWorkspace()

        const confirmDelete = async () => {
            await deleteWorkspace(Number($accessor.workspace.getWorkspaceId))
            $accessor.workspace.setDeleteWorkspaceModal(false)
        }

        return {
            icons,
            confirmDelete,
        }
    },
})
</script>
