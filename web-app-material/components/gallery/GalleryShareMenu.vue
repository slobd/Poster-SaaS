<template>
    <VMenu offset-y class="tw-w-32">
        <template #activator="{ on, attrs }">
            <slot name="activator" v-bind="{ on, attrs }"></slot>
        </template>
        <VList>
            <VListItemGroup>
                <VListItem class="tw-h-12 tw-opacity-75">
                    <VListItemIcon class="tw-mr-3 tw-my-0 tw-self-center">
                        <FontAwesomeIcon :icon="icons.faEnvelope" />
                    </VListItemIcon>
                    <VListItemTitle>Email</VListItemTitle>
                </VListItem>
                <VListItem class="tw-h-12">
                    <VListItemIcon class="tw-mr-3 tw-my-0 tw-self-center">
                        <FontAwesomeIcon :icon="icons.faTwitter" color="#1DA1F2" />
                    </VListItemIcon>
                    <VListItemTitle class="tw-opacity-75">Twitter</VListItemTitle>
                </VListItem>
            </VListItemGroup>
        </VList>
    </VMenu>
</template>

<script lang="ts">
import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/pro-solid-svg-icons'

export default Vue.extend({
    components: {
        FontAwesomeIcon,
    },
    computed: {
        icons(): Record<string, IconDefinition> {
            return {
                faTwitter,
                faEnvelope,
            }
        },
    },
})
</script>

<style></style>
