<template>
    <VDialog persistent :value="value" width="900" @change="$emit('input', $event)">
        <VCard color="white">
            <VCardText>
                <h2 class="text-h3 tw-py-5 tw-text-center tw-text-black">
                    {{ message }}
                </h2>
                <VRow>
                    <VCol cols="12">
                        <VImg
                            max-height="400"
                            :src="require('~/assets/img/upload-fiesta.svg')"
                            alt="Upload Successful"
                        />
                    </VCol>
                </VRow>
                <VRow class="tw-flex tw-flex-row tw-justify-items-center tw-items-center">
                    <VCol class="tw-flex tw-justify-end">
                        <VBtn width="150" :right="true" :to="`/workspace/${workspaceId}/gallery`">
                            Gallery
                        </VBtn>
                    </VCol>
                    <VCol>
                        <VBtn
                            width="150"
                            color="primary"
                            :to="`/workspace/${workspaceId}/gallery/${posterId}/document`"
                        >
                            View Document
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { computed, useContext } from '@nuxtjs/composition-api'

export default Vue.extend({
    props: {
        posterId: {
            type: [String, Number],
            default: '',
        },
        message: {
            type: String,
            required: false,
            default: '',
        },
        value: {
            type: Boolean,
            required: true,
        },
    },
    setup(_props) {
        const { $accessor } = useContext()
        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

        return {
            workspaceId,
        }
    },
})
</script>

<style></style>
