<template>
    <VRow justify="center">
        <VDialog v-model="dialog" max-width="520" class="tw-h-36" persistent>
            <VCard>
                <VCardTitle class="text-h5">
                    Are you sure you want to close the session?
                </VCardTitle>

                <!-- <VCardText>
          Click on 'Agree' to leave the live session.
        </VCardText> -->

                <VCardActions>
                    <VSpacer></VSpacer>

                    <VBtn color="secondary" text @click="dialogAction(false)">
                        No, keep the session open
                    </VBtn>

                    <VBtn color="primary" @click="dialogAction(true)">
                        Yes, close the session
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </VRow>
</template>
<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'
export default defineComponent({
    name: 'ExitDialogue',
    props: {
        input: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit }) {
        const dialog = ref(props.input)

        function dialogAction(val) {
            dialog.value = val
            if (dialog.value) {
                emit('confirm', dialog.value)
            } else emit('stay', dialog.value)
        }

        return {
            dialogAction,
            dialog,
        }
    },
})
</script>
