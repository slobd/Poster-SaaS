<template>
    <VCard class="tw-p-3.5 tw-mb-5 tw-rounded-md">
        <ValidationProvider v-slot="vpTitle" name="email" mode="eager" rules="required" slim>
            <VTextField
                v-model="newTaskName"
                outlined
                dense
                label="Task Name"
                class="input-task-name tw-rounded-md"
                :error-messages="vpTitle.errors"
            />
        </ValidationProvider>
        <div class="tw-flex tw-justify-end">
            <VBtn small text @click="$emit('close')"> Cancel </VBtn>
            <VBtn
                color="primary"
                small
                depressed
                class="tw-ml-1"
                :disabled="!newTaskName"
                @click="$emit('addTask', newTaskName)"
            >
                Save
            </VBtn>
        </div>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
    name: 'TaskCardNew',
    setup() {
        const newTaskName = ref()

        return { newTaskName }
    },
})
</script>

<style lang="scss" scoped>
.input-task-name {
    font-size: 14px;

    .v-label {
        font-size: 14px;
    }
}
</style>
