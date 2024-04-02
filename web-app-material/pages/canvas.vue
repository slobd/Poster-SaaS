<template>
    <div class="tw-flex tw-flex-col tw-h-full tw-overflow-y-auto">
        <div>
            <WebMetadata />
        </div>
        <CanvasHeader>
            <template #title> Scientific Canvas </template>
            <template #buttons>
                <VBtn v-if="$route.params.canvasId" outlined @click="newCanvasModal = true">
                    New canvas
                    <FontAwesomeIcon :icon="icons.faPlus" class="ml-2"></FontAwesomeIcon>
                </VBtn>
            </template>
        </CanvasHeader>
        <nuxt-child />
        <!-- TODO: Refactor into its own component -->
        <VDialog v-model="newCanvasModal" width="500">
            <VCard>
                <VCardTitle class="text-h5 grey lighten-2"> Create a new Canvas </VCardTitle>
                <VCardText>
                    <p class="tw-my-2">
                        If you create a new canvas, your current progress will be lost.
                    </p>
                    <p class="tw-mb-2">Do you wish to continue?</p>
                </VCardText>
                <VCardActions>
                    <VSpacer></VSpacer>
                    <VBtn outlined color="primary" @click="newCanvasModal = false"> Cancel </VBtn>
                    <VBtn color="error" simple @click="resetCanvasState">
                        Ok, create new canvas
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapGetters } from 'vuex'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '@/composables/common/useIcons'

export default defineComponent({
    setup() {
        const { icons } = useIcons({
            faPlus,
        })

        return {
            icons,
        }
    },
    data() {
        return {
            authenticated: this.$store.state.auth.loggedIn,
            newCanvasModal: false,
        }
    },
    computed: {
        ...mapGetters('tenant', ['getTheme']),
    },
    methods: {
        resetCanvasState() {
            this.$store.commit('canvas/resetCanvasState')
            this.newCanvasModal = false
            this.$router.push('/canvas/new/layout')
        },
    },
})
</script>
