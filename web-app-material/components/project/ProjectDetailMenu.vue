<template>
    <div>
        <VMenu v-if="$can('update', caslWorkspace)" offset-x offset-y transition="scale-transition">
            <template #activator="{ on, attrs }">
                <VBtn
                    v-bind="attrs"
                    icon
                    color="tw-text-black"
                    size="16"
                    class="tw-mb-0.5 tw-text-right"
                    v-on="on"
                >
                    <FontAwesomeIcon
                        class=""
                        :icon="icons.faEllipsisV"
                        color="tw-text-black"
                        width="24"
                    />
                </VBtn>
            </template>
            <VCard class="mx-auto">
                <VList>
                    <VListItem
                        v-if="$can('update', caslWorkspace)"
                        @click="openProjectDeleteDialog"
                    >
                        <VListItemTitle class="tw-font-bold">Delete</VListItemTitle>
                    </VListItem>
                </VList>
            </VCard>
        </VMenu>
        <VDialog v-model="dialog" width="500">
            <template #activator="{ on, attrs }">
                <slot name="activator" v-bind="{ on, attrs }"></slot>
            </template>

            <VCard>
                <VCardTitle class="text-h5 grey lighten-2">
                    Are you sure you want to delete this item?
                </VCardTitle>

                <VCardText class="tw-flex tw-flex-col tw-items-center tw-space-y-4 tw-pt-5">
                    <FontAwesomeIcon
                        :icon="icons.faExclamationCircle"
                        class="error--text"
                        size="6x"
                    />
                    <div class="text-h5 tw-text-center">
                        All associated data will be deleted too! You can't undo this
                    </div>
                </VCardText>

                <VDivider />

                <VCardActions>
                    <VSpacer />
                    <VBtn color="primary" text @click="dialog = false"> Cancel </VBtn>
                    <VBtn color="error" @click="confirmDelete"> Delete </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<script lang="ts">
import { faEllipsisV } from '@fortawesome/pro-solid-svg-icons'
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons'
import { computed, defineComponent, ref, useContext } from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import useIcons from '~/composables/common/useIcons'
import useProject from '~/composables/project/useProject'

export default defineComponent({
    name: 'ProjectDetailMenu',
    props: {
        value: {
            type: Number,
            default: null,
        },
    },
    setup(props) {
        const { icons } = useIcons({
            faEllipsisV,
            faExclamationCircle,
        })
        const { $accessor } = useContext()
        const { deleteProject } = useProject()

        const dialog = ref(false)
        const caslWorkspace = computed(() => {
            return subject('Workspace', { ...$accessor.workspace.getDefaultWorkspace })
        })

        const openProjectDeleteDialog = () => {
            dialog.value = true
        }

        const confirmDelete = () => {
            dialog.value = false
            deleteProject(props.value)
        }

        return {
            dialog,
            icons,
            caslWorkspace,
            openProjectDeleteDialog,
            confirmDelete,
        }
    },
})
</script>
