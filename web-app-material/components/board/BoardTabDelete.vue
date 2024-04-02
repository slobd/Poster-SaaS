<template>
    <VCard>
        <VCardTitle class="text-h5 grey lighten-2">
            Are you sure you want to delete this tab?
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
            <VBtn color="primary" text @click="$emit('closeModal')"> Cancel </VBtn>
            <VBtn color="error" depressed @click="removeBoard()"> Delete </VBtn>
        </VCardActions>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, useContext } from '@nuxtjs/composition-api'
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'BoardTabDelete',
    props: {
        boardId: {
            type: Number,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { $accessor } = useContext()
        const { icons } = useIcons({
            faExclamationCircle,
        })

        async function removeBoard() {
            await $accessor.board.deleteBoard(props.boardId)
            emit('refreshProject')
            emit('closeModal')
        }

        return {
            icons,
            removeBoard,
        }
    },
})
</script>
