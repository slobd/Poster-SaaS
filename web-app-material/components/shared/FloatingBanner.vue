<template>
    <VRow
        v-if="value"
        justify="center"
        class="tw-fixed tw-bottom-0 tw-inset-x-0 tw-mb-0 tw-z-10"
        data-cy="FloatingBanner"
    >
        <VCol cols="8">
            <VBanner elevation="24" :class="bgColor" rounded="lg" single-line>
                <div class="tw-flex tw-items-center tw-justify-between tw-py-2">
                    <p class="tw-font-medium tw-text-white tw-m-0">
                        <span v-if="exclamationIcon">
                            <FontAwesomeIcon :icon="exclamationIcon" />
                        </span>
                        {{ message }}
                    </p>
                    <VBtn icon color="white" @click="$emit('input', false)">
                        <FontAwesomeIcon :icon="dismissIcon" />
                    </VBtn>
                </div>
            </VBanner>
        </VCol>
    </VRow>
</template>

<script lang="ts">
import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons'
import { FloatingBannerEnum } from '~/types/banner'
/**
 * @deprecated Use $accessor to access the banner mutation and accions with type definitions
 */
export default Vue.extend({
    components: {
        FontAwesomeIcon,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        message: {
            type: String,
            default: '',
            required: true,
        },
        type: {
            type: String,
            default: 'default',
            validator(value) {
                return value in FloatingBannerEnum
            },
        },
    },
    computed: {
        dismissIcon() {
            return faTimes
        },
        exclamationIcon() {
            if (this.type === FloatingBannerEnum.error) {
                return faExclamationCircle
            } else {
                return ''
            }
        },
        bgColor(): Record<string, boolean> {
            return {
                'tw-bg-indigo-600': this.type === FloatingBannerEnum.default,
                'tw-bg-red-600': this.type === FloatingBannerEnum.error,
                'tw-bg-green-500': this.type === FloatingBannerEnum.success,
            }
        },
    },
})
</script>
