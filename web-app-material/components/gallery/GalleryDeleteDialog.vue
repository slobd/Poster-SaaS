<template>
    <VDialog v-model="dialog" width="500">
        <!-- <VDialog :value="value" width="500" @input="$emit('input', $event)"> -->
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
                <VBtn color="primary" text @click="dialog = false"> Cancel </VBtn>
                <VBtn color="error" @click="deletePoster"> Delete </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons'
import { defineComponent } from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'
import usePoster from '~/composables/gallery/usePoster'

export default defineComponent({
    components: {
        FontAwesomeIcon,
    },

    setup() {
        // Register composables
        const { icons } = useIcons({ faExclamationCircle })
        const { poster, deletePoster } = usePoster()
        const dialog = false

        return {
            icons,
            poster,
            dialog,
            deletePoster,
        }
    },
})
</script>

<style></style>
