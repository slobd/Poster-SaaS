<template>
    <VDialog v-model="dialog" width="50%">
        <template #activator="{ on, attrs }">
            <VCard class="tw-w-1/3 tw-px-4 tw-text-center tw-py-10 tw-mx-auto tw-mt-10">
                <p class="text-sm">{{ message }}</p>
                <div v-if="image">
                    <p>See how it could look like!</p>
                    <VBtn color="secondary" dark v-bind="attrs" v-on="on"> Discover it </VBtn>
                </div>
            </VCard>
        </template>

        <VCard v-if="image" class="tw-p-5">
            <VImg max-height="400" alt="example image" :src="image" />

            <VDivider />

            <VCardActions>
                <VSpacer />
                <VBtn outlined color="primary" text @click="dialog = false"> Back </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script>
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
    name: 'NoContentDialog',
    props: {
        message: {
            type: String,
            default: 'There is no content to show right now.',
            require: false,
        },
        image: {
            type: String,
            default: '',
            require: false,
        },
    },

    setup() {
        const dialog = ref(false)

        return {
            dialog,
        }
    },
})
</script>

<style></style>
