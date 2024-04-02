<template>
    <VListItem :to="item.to" router exact class="hover:tw-bg-gray-100">
        <VListItemAction class="tw-mr-0 tw-p-1 tw-opacity-60 tw-text-xs">
            <FontAwesomeLayers v-if="isIconWithLayers" class="fa-fw tw-mx-1">
                <FontAwesomeIcon
                    v-for="(icon, index) in item.icon"
                    :key="index"
                    :icon="icon.icon"
                    :transform="icon.transform"
                />
            </FontAwesomeLayers>
            <FontAwesomeIcon v-else :icon="item.icon" fixed-width />
        </VListItemAction>

        <VListItemContent class="tw-font-bold">
            <VListItemTitle v-text="item.title" />
        </VListItemContent>
    </VListItem>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

export interface IAppNavigationDrawerItem {
    icon:
        | IconDefinition
        | {
              icon: IconDefinition
              transform: string
          }[]
    title: string
    to: string
}

export default defineComponent({
    name: 'AppNavigationDrawerItem',
    props: {
        item: {
            type: Object as PropType<IAppNavigationDrawerItem>,
            required: true,
        },
    },
    setup({ item }) {
        const isIconWithLayers = computed(() => Array.isArray(item.icon))

        return {
            isIconWithLayers,
        }
    },
})
</script>
