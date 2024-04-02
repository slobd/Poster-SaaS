<template>
    <div class="tw-px-12 tw-py-4">
        <h1 class="tw-text-base tw-pb-3">User Settings</h1>

        <VTabs background-color="transparent" color="basil" class="tw-pb-8">
            <VTab v-for="link in links" :key="link.text" class="tw-normal-case" :to="link.to">
                {{ link.text }}
            </VTab>
        </VTabs>

        <NuxtChild />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
    layout: 'tenant',
    setup() {
        const links = ref([
            {
                text: 'Profile',
                to: '/user-settings/profile',
            },
            {
                text: 'About me (skills, position...)',
                to: '/user-settings/expert-info',
            },
        ])

        return {
            links,
        }
    },
})
</script>
