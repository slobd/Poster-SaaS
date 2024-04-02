<template>
    <ValidationObserver ref="observer" tag="form" data-cy="login" class="tw-h-full">
        <VRow class="tw-h-full" justify="center" align="center" align-content="center">
            <VCol class="tw-p-10" md="5" sm="7">
                <VCard elevation="2" class="tw-w-full tw-p-8">
                    <VImg
                        contain
                        :src="primaryLogo"
                        alt="PosterLab"
                        height="2.5rem"
                        width="11.5rem"
                        class="tw-mx-auto"
                    />
                    <VCardTitle class="text-h7 tw-font-bold pt-5 tw-justify-center">
                        Sign in
                    </VCardTitle>
                    <VCardText class="text-body-1">Please insert your email to continue</VCardText>
                    <VRow justify="center">
                        <VCol cols="8">
                            <ValidationProvider
                                v-slot="vpEmail"
                                name="email"
                                mode="eager"
                                rules="email|required"
                                slim
                            >
                                <VTextField
                                    v-model="email"
                                    outlined
                                    label="Work Email"
                                    height="1"
                                    :error-messages="vpEmail.errors"
                                />
                            </ValidationProvider>
                        </VCol>
                        <VCol cols="12" class="tw-flex tw-justify-center tw-p-0">
                            <VBtn
                                class="tw-w-32"
                                color="primary"
                                type="submit"
                                @click.prevent="handleLogin()"
                            >
                                Sign in
                            </VBtn>
                        </VCol>
                    </VRow>
                </VCard>
            </VCol>
        </VRow>
    </ValidationObserver>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useRoute } from '@nuxtjs/composition-api'
import { APIRoutesV2 } from '~/types/typing'

export default defineComponent({
    name: 'Login',
    auth: false,
    layout: 'empty',
    setup() {
        const { $axios, $logger } = useContext()
        const $route = useRoute()
        const email = ref('')
        const domainHint = ref('')
        const loginUrlPart1 = ref(process.env.webAppAzureUrlPart1)
        const loginUrlPart2 = ref(process.env.webAppAzureUrlPart2)
        const webAppAzureSignUpUrl = ref(process.env.webAppAzureSignUpUrl)

        const primaryLogo = computed(() => {
            return require('~/assets/img/PosterLabLogo.svg')
        })

        const signInUrl = computed(() => {
            return `${loginUrlPart1.value}${domainHint.value}&login_hint=${email.value}${loginUrlPart2.value}`
        })

        async function handleLogin(): Promise<void> {
            try {
                if ($route.value.query.token) {
                    await $axios.$get(APIRoutesV2.IAM__INVITE__ACCEPT_INVITE, {
                        params: {
                            email: email.value,
                            token: $route.value.query.token,
                        },
                    })
                }

                const idp = await $axios.$get(APIRoutesV2.IDENTITY_PROVIDER__EMAIL, {
                    params: { email: email.value },
                })

                if (idp && idp.domain) {
                    domainHint.value = `&domain_hint=${idp.domain}`
                    window.open(signInUrl.value, '_self')
                } else if (await checkUserInAzure()) {
                    window.open(signInUrl.value, '_self')
                } else {
                    window.open(webAppAzureSignUpUrl.value, '_self')
                }
            } catch (e) {
                // TODO: Use error banner
                $logger.error(e)
            }
        }

        async function checkUserInAzure(): Promise<boolean> {
            return await $axios.$get(APIRoutesV2.AZURE__USERS__EMAIL, {
                params: {
                    email: email.value,
                },
            })
        }

        return {
            email,
            primaryLogo,
            handleLogin,
        }
    },
})
</script>

<style scoped></style>
