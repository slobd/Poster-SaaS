<template>
    <div class="tw-flex tw-flex-row tw-justify-end">
        <VBtn v-if="back.text" text :disabled="disableBack" @click="handleBackClick">
            <FontAwesomeIcon :icon="icons.faArrowLeft" />
            {{ back.text }}
        </VBtn>
        <VBtn
            v-show="next.text"
            color="primary"
            class="sm:tw-ml-2 sm:tw-px-10"
            :loading="nextLoading"
            :disabled="disableNext"
            @click="handleNextClick"
        >
            <span class="tw-flex tw-flex-nowrap tw-items-center">
                {{ next.text }}
                <FontAwesomeIcon :icon="icons.faArrowRight" class="ml-1" fixed-width />
            </span>
        </VBtn>
    </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'
import { mapGetters } from 'vuex'
import { faArrowLeft, faArrowRight } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'CanvasNavUtility',
    props: {
        nextLoading: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const { icons } = useIcons({
            faArrowLeft,
            faArrowRight,
        })

        return {
            icons,
        }
    },
    computed: {
        ...mapGetters('sidebar', {
            back: 'getBack',
            next: 'getNext',
            disableNext: 'getNextDisabled',
            disableBack: 'getBackDisabled',
        }),
    },
    methods: {
        handleBackClick() {
            this.$router.push(this.back.to)
            this.$store.dispatch('sidebar/backClick')
        },
        handleNextClick() {
            if (this.next.to) {
                this.$router.push(this.next.to)
                this.$store.dispatch('sidebar/nextClick')
            } else {
                this.$emit('click')
            }
        },
    },
})
</script>
