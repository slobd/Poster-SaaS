<template>
    <VContainer fill-height>
        <WebMetadata />
        <VCard class="tw-w-full tw-p-4">
            <VRow min-height="500px">
                <VCol md="6" class="tw-p-8">
                    <div class="tw-space-y-6">
                        <h1 class="text-h3">Welcome to PosterLab</h1>
                        <p class="text-body-1">
                            PosterLab is a digital collaboration platform to make your partnerships
                            succeed. We provide you with all the tools to make innovation in a
                            partner-ecosystem effective and efficient. You can easily plan, share,
                            monitor and track your R&D projects.
                        </p>
                        <div v-if="!$auth.loggedIn">
                            <VBtn color="primary" to="/auth/login"> Sign in</VBtn>
                        </div>
                    </div>
                </VCol>
                <VCol md="6">
                    <!-- <VResponsive> -->
                    <VImg
                        class="tw-my-8"
                        max-height="700"
                        contain
                        :lazy-src="landingImage"
                        :src="landingImage"
                    ></VImg>
                    <!-- </VResponsive> -->
                </VCol>
            </VRow>
        </VCard>
    </VContainer>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    onMounted,
    ref,
    useContext,
    useRoute,
    useRouter,
} from '@nuxtjs/composition-api'
import useAuthUtil from '~/composables/common/useAuthUtil'
import { APIRoutes } from '~/types/typing'

export default defineComponent({
    layout: 'auth',
    auth: false,
    setup() {
        const disable = ref(false)
        const { $accessor, $auth, $axios } = useContext()
        const { isTenantMember } = useAuthUtil()
        const $route = useRoute()
        const router = useRouter()

        // Computed
        const tenantName = computed(() => {
            return $accessor.tenant.getTenantName
        })

        const landingImage = computed(() => {
            return require('~/assets/img/landing-page.svg')
        })

        // Methods
        function _handleBanner() {
            $accessor.banner.setBannerWithTimeout({
                type: 'default',
                message: `You are already a member of ${tenantName.value}`,
                value: true,
            })
        }

        async function _handleInviteUser() {
            try {
                await $axios.$post(APIRoutes.IAM_INVITE_USER)

                $accessor.banner.setBannerWithTimeout({
                    type: 'success',
                    message: `You are now a member of ${tenantName.value}`,
                    value: true,
                })
            } catch (error) {
                if (error?.response?.status === 403)
                    $accessor.banner.setBannerWithTimeout({
                        type: 'default',
                        message: error.response.data.error,
                        value: true,
                    })

                if (error?.response?.status === 500)
                    $accessor.banner.setBannerWithTimeout({
                        type: 'default',
                        message: error.response.data.error,
                        value: true,
                    })
            }
        }

        onMounted(async () => {
            const inviteToken = $route.value.query.invite
            const isLoggedIn = $auth.loggedIn

            if (inviteToken) {
                if (isLoggedIn) {
                    if (isTenantMember.value) {
                        // HINT: needed <client-only> on VFloatingBanner to avoid issue with ssr
                        _handleBanner()
                        return
                    }

                    await _handleInviteUser()
                    return
                }

                if (!isTenantMember.value) {
                    $accessor.setAfterLoginPath($route.value.fullPath)
                    router.push('/auth/register')
                }
            }
        })

        return {
            disable,
            tenantName,
            landingImage,
        }
    },
})
</script>

<style>
.v-skeleton-loader__image {
    height: 100%;
    border-radius: 0;
}
</style>
