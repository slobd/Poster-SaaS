<template>
    <div class="tw-flex tw-justify-between tw-items-center tw-h-16 tw-px-8 tw-bg-gray-200">
        <em>
            {{ title }}
        </em>
        <div class="tw-flex tw-justify-end tw-divide-x tw-divide-gray-400">
            <div>
                <VBtn :icon="icons.faUserFriends" simple class="">
                    {{ saveLaterButtonText }}
                </VBtn>
            </div>
            <div>
                <VBtn :icon="faSave" simple class="tw-text-gray-6">
                    {{ astReviewText }}
                </VBtn>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'
import { faUserFriends } from '@fortawesome/pro-solid-svg-icons'
import { faSave } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '@/composables/common/useIcons'

export default defineComponent({
    name: 'CanvasInfoBar',
    setup() {
        const { icons } = useIcons({
            faUserFriends,
            faSave,
        })

        return {
            icons,
        }
    },
    data() {
        return {
            title: 'You are creatting a new canvas',
            saveLaterButtonText: 'Save for later',
            astReviewText: 'Ask for review',
        }
    },
})
</script>

<style></style>
