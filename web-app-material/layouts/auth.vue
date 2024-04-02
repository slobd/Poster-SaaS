<template>
    <VApp>
        <VAppBar clipped-left fixed app class="tw-px-36">
            <NuxtLink to="/" class="tw-flex tw-items-center">
                <img alt="primary logo" class="tw-w-auto tw-h-10 tw-sm:h-12" :src="primaryLogo" />
            </NuxtLink>
            <VToolbarTitle class="tw-ml-5">{{ $accessor.tenant.tenantName }}</VToolbarTitle>
            <VSpacer />

            <div class="tw-space-x-4">
                <div v-if="!$auth.loggedIn">
                    <!-- <VBtn to="/auth/login" text>
                        <span>  </span>
                    </VBtn> -->
                    <VBtn color="primary" depressed to="/auth/login">Sign In</VBtn>
                    <!-- <VBtn to="/gallery" outlined color="primary"> Join as guest </VBtn> -->

                    <!-- <VBtn to="/auth/register" color="primary"> Create Account </VBtn> -->
                </div>
                <div v-else class="tw-space-x-4">
                    <VBtn @click="logout">Logout</VBtn>
                    <VBtn :to="homePageUrl" color="primary" depressed>Back to home</VBtn>
                </div>
            </div>
        </VAppBar>

        <VMain :class="backgroundColor">
            <Nuxt />
        </VMain>

        <VFooter app absolute padless>
            <VCard flat tile width="100%" class="tw-justify-center tw-items-center">
                <div class="tw-flex tw-items-center tw-justify-center tw-mt-2">
                    <a href="https://posterlab.co" target="_blank">
                        <VImg :src="footerLogo" height="40" max-width="140" class="tw-mt-5"></VImg>
                    </a>
                </div>

                <VCardText class="tw-flex tw-justify-center tw-space-x-4 tw-mb-3">
                    <a
                        :href="information.helpAndSupport"
                        class="z-10 tw-no-underline"
                        target="_blank"
                    >
                        Help & Support
                    </a>
                    <a :href="information.termsOfUse" class="z-10 tw-no-underline" target="_blank">
                        Terms and conditions
                    </a>
                    <a
                        :href="information.privacyPolicy"
                        class="z-10 tw-no-underline"
                        target="_blank"
                    >
                        Privacy Policy
                    </a>
                </VCardText>
            </VCard>
        </VFooter>
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
import { computed, defineComponent, ref, useContext } from '@nuxtjs/composition-api'
import useAuthUtil from '~/composables/common/useAuthUtil'

export default defineComponent({
    name: 'Auth',
    setup() {
        const disable = ref(false)
        const { $accessor } = useContext()
        const { logout } = useAuthUtil()
        const information = {
            privacyPolicy: process.env.privacyPolicy,
            helpAndSupport: process.env.helpAndSupport,
            termsOfUse: process.env.termsOfUse,
        }

        // Computed
        const primaryLogo = computed(() => {
            const theme = $accessor.tenant.getTheme
            if (typeof theme.images?.primaryLogo === 'string') {
                return require(`~/assets/img/${theme.images.primaryLogo}`)
            } else if (typeof theme.images?.primaryLogo === 'object') {
                if (theme.images.primaryLogo.url) return theme.images.primaryLogo.url
                else return theme.images.primaryLogo.location
            }
        })

        const backgroundColor = computed(() => {
            return 'grey lighten-4'
        })

        const buttonText = computed(() => {
            return 'Log in'
        })

        const footerLogo = computed(() => {
            return require(`~/assets/img/PosterLabLogo.svg`)
        })

        const homePageUrl = computed(() => {
            return `/workspace/${$accessor.workspace.getWorkspaceId}/home`
        })

        // Methods

        function hideFloatingBanner() {
            $accessor.banner.setBanner({
                value: false,
            })
        }

        return {
            disable,
            primaryLogo,
            backgroundColor,
            buttonText,
            footerLogo,
            information,
            homePageUrl,
            logout,
            hideFloatingBanner,
        }
    },
})
</script>
