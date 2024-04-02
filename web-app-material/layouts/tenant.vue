<template>
    <VApp :key="key">
        <AppNavigationDrawer :layout-type="'firstLevel'" />

        <VAppBar clipped-left fixed app flat color="white" height="56px">
            <NuxtLink :to="homePageUrl" class="tw-ml-2">
                <img :src="primaryLogo" alt="PosterLab" class="top-logo-img" />
            </NuxtLink>
            <VDivider class="tw-absolute tw-w-full tw-bottom-0 tw-left-0" />
        </VAppBar>

        <VMain>
            <Nuxt />
        </VMain>
        <client-only>
            <FloatingBanner
                :value="$accessor.banner.getBanner.value"
                :type="$accessor.banner.getBanner.type"
                :message="$accessor.banner.getBanner.message"
                @input="hideFloatingBanner"
            />
        </client-only>
    </VApp>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'
import { onMounted } from '@vue/composition-api'

export default defineComponent({
    name: 'TenantLayout',
    setup() {
        const { $accessor } = useContext()
        const key = $accessor.iam.key

        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)
        const homePageUrl = computed(() => `/workspace/${workspaceId.value}/home`)
        const primaryLogo = computed(() => {
            if ($accessor.tenant.getTheme.images?.primaryLogo?.url)
                return $accessor.tenant.getTheme.images?.primaryLogo?.url
            else return require('~/assets/img/PosterLabLogo.svg')
        })

        onMounted(async () => {
            await $accessor.iam.fetchAllUserRules()
        })

        function hideFloatingBanner() {
            $accessor.banner.setBanner({
                value: false,
            })
        }

        return {
            key,
            homePageUrl,
            primaryLogo,
            hideFloatingBanner,
        }
    },
})
</script>

<style scoped>
.top-header {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 56px;
}

.top-logo-img {
    display: block;
    height: 40px;
}
</style>
