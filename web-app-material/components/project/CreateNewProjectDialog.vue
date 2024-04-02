<template>
    <VDialog
        :value="$accessor.project.getCreateProjectModal"
        persistent
        transition="scroll-x-reverse-transition"
        max-width="50%"
    >
        <ValidationObserver v-slot="{ handleSubmit, invalid }" slim>
            <VCard class="">
                <VCardTitle class="tw-flex tw-items-center tw-justify-between tw-py-6">
                    <span>Add new project</span>
                </VCardTitle>
                <VCardText>
                    <VRow class="">
                        <VCol cols="12">
                            <VeeTextField
                                v-model="projectName"
                                rules="required"
                                required
                                outlined
                                label="Insert a new project name"
                                height="30"
                            ></VeeTextField>
                        </VCol>
                    </VRow>
                    <VDivider />
                    <VCardActions class="tw-flex tw-justify-end">
                        <VBtn text @click="cancelNewProject">Cancel</VBtn>
                        <VBtn
                            color="primary"
                            :disabled="invalid"
                            @click="handleSubmit(createNewProject)"
                        >
                            Create</VBtn
                        >
                    </VCardActions>
                </VCardText>
            </VCard>
        </ValidationObserver>
    </VDialog>
</template>
<script lang="ts">
import { defineComponent, ref, useContext, useRoute } from '@nuxtjs/composition-api'
import VeeTextField from '~/components/shared/inputs/VeeTextField.vue'

export default defineComponent({
    name: 'CreateNewProjectDialog',
    components: { VeeTextField },
    setup() {
        const $route = useRoute()
        const { $accessor } = useContext()

        const projectName = ref('')

        function cancelNewProject() {
            projectName.value = ''
            $accessor.project.setCreateProjectModal(false)
        }

        async function createNewProject() {
            await $accessor.project.createProject({
                workspaceId: parseInt($route.value.params.workspaceId),
                tenantId: $accessor.tenant.getTenantId as number,
                name: projectName.value,
            })
            await $accessor.project.fetchAllProject({
                data: {
                    name: $accessor.project.getSearchKey,
                },
                workspaceId: parseInt($route.value.params.workspaceId),
            })
            $accessor.project.setCreateProjectModal(false)
            projectName.value = ''
        }

        return {
            projectName,
            cancelNewProject,
            createNewProject,
        }
    },
})
</script>
