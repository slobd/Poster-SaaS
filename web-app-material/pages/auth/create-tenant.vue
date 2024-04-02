<template>
    <VContainer fill-height>
        <VToolbar class="tw-mb-4 tw-bg-transparent" elevation="0">
            <VToolbarTitle class="text-h4 tw-mx-auto">Create your poster session</VToolbarTitle>
        </VToolbar>
        <VRow style="min-height: calc(100% - 64px)">
            <VCol cols="12">
                <VStepper
                    v-model="step"
                    non-linear
                    class="tw-bg-transparent tw-pr-10"
                    elevation="0"
                >
                    <VStepperHeader class="tw-bg-white tw-mx-36 tw-rounded-xl">
                        <VStepperStep
                            :editable="editable"
                            :complete="step > 1"
                            :class="step === 1 ? 'tw-bg-gray-200' : ''"
                            step="1"
                            class="tw-rounded-l-xl"
                        >
                            Create an account
                        </VStepperStep>

                        <VDivider></VDivider>

                        <VStepperStep
                            class="tw-px-3 tw-py-0"
                            :editable="$auth.loggedIn"
                            :class="step === 2 ? 'tw-bg-gray-200' : ''"
                            :complete="step > 2"
                            step="2"
                        >
                            Choose a plan
                            <p class="tw-text-xs tw-font-medium tw-text-primary">
                                Your first client account is free!
                            </p>
                        </VStepperStep>

                        <VDivider></VDivider>

                        <VStepperStep
                            :editable="customizationEditable"
                            :class="step === 3 ? 'tw-bg-gray-200' : ''"
                            :complete="step > 2"
                            class="tw-px-3 tw-rounded-r-xl"
                            step="3"
                        >
                            Customize your organization
                        </VStepperStep>
                    </VStepperHeader>

                    <!-- <VStepperItems class="tw-m-2 tw-mt-4 tw-rounded-xl tw-bg-white" :elevation="2"> -->
                    <VStepperItems class="tw-mt-4 tw-mx-36" :elevation="2">
                        <VStepperContent step="1" class="tw-p-0">
                            <template v-if="$auth.loggedIn">
                                <VRow justify="center">
                                    <VCol cols="12" class="tw-py-4">
                                        <VCard
                                            class="
                                                tw-p-8
                                                tw-flex-rows
                                                tw-justify-center
                                                tw-items-center
                                                tw-rounded-xl
                                            "
                                        >
                                            <VCardTitle class="tw-justify-center">
                                                You are logged in
                                                {{
                                                    $auth.user.firstName +
                                                    ' ' +
                                                    $auth.user.lastName
                                                }}.
                                                <br />
                                            </VCardTitle>
                                            <VCardSubtitle class="tw-justify-center tw-text-center">
                                                Not you? Logout to use different account
                                            </VCardSubtitle>
                                            <VCardText>
                                                <NuxtLink to="/auth/create-tenant">
                                                    <VRow class="tw-space-x-4 tw-my-8">
                                                        <span class="tw-pt-1 text-body-1">{{
                                                            $auth.user.email
                                                        }}</span>
                                                        <VBtn @click="logout">Log out</VBtn>
                                                    </VRow>
                                                </NuxtLink>
                                            </VCardText>
                                            <VCardActions class="tw-justify-center">
                                                <VBtn color="primary" @click="step = 2">Next</VBtn>
                                            </VCardActions>
                                        </VCard>
                                    </VCol>
                                </VRow>
                            </template>
                            <template v-else>
                                <VCard
                                    v-if="!hasAccount"
                                    class="tw-m-2 tw-rounded-xl"
                                    elevation="2"
                                >
                                    <VCardText>
                                        <VRow justify="center">
                                            <VCol md="9">
                                                <AuthRegisterForm
                                                    v-if="!registered"
                                                    submit-button="Continue"
                                                    query="?from=event"
                                                    :post-submit-handle="postRegisterHandler"
                                                    @has-login="hasAccount = $event"
                                                />
                                                <div v-else class="text-h5 text-center">
                                                    Your organization is ready.
                                                    <br />
                                                    Please confirm your email address
                                                </div>
                                            </VCol>
                                        </VRow>
                                    </VCardText>
                                </VCard>
                                <VCard v-if="hasAccount">
                                    <VCardText>
                                        <VRow justify="center">
                                            <VCol md="9">
                                                <VCard class="tw-p-8 tw-rounded-xl">
                                                    <VCardTitle class="text-h6">
                                                        Sign in
                                                    </VCardTitle>
                                                    <VCardSubtitle>
                                                        Don't have an account?
                                                        <VBtn
                                                            text
                                                            small
                                                            class="blue--text darken-1 tw-ml-1"
                                                            @click="hasAccount = false"
                                                        >
                                                            Create an account
                                                            <!-- <FontAwesomeIcon :icon="icons.faArrowRight" /> -->
                                                        </VBtn>
                                                    </VCardSubtitle>
                                                    <AuthLoginForm
                                                        submit-btn-text="Sign In"
                                                        to="/auth/create-tenant"
                                                        :post-submit-handle="postLoginHandler"
                                                    />
                                                </VCard>
                                            </VCol>
                                        </VRow>
                                    </VCardText>
                                </VCard>
                            </template>
                        </VStepperContent>

                        <VStepperContent step="2" class="tw-p-0">
                            <PricingPlan @next-step="step = $event" />
                        </VStepperContent>

                        <VStepperContent step="3" class="tw-p-0">
                            <VCard class="tw-h-full tw-py-5">
                                <ValidationObserver
                                    ref="observer"
                                    v-slot="{ handleSubmit }"
                                    tag="form"
                                    data-cy="login"
                                >
                                    <VCardText>
                                        <VRow dense justify="center">
                                            <VCol md="11">
                                                <VCard class="tw-px-8">
                                                    <VRow class="tw-pt-5">
                                                        <VCol dense>
                                                            <div>Organization name</div>
                                                            <VeeTextField
                                                                v-model="tenantData.name"
                                                                rules="required"
                                                                name="Organization Name"
                                                                vid="organizationName"
                                                                required
                                                                outlined
                                                            />
                                                        </VCol>
                                                    </VRow>
                                                    <VRow dense>
                                                        <VCol dense class="tw-py-0">
                                                            <div>Event Subdomain</div>
                                                            <ValidationProvider
                                                                v-slot="vpDefaultOrigin"
                                                                name="Subdomain"
                                                                mode="eager"
                                                                :rules="{
                                                                    regex: /^\S+$/,
                                                                    required: true,
                                                                }"
                                                                slim
                                                                dense
                                                            >
                                                                <VTextField
                                                                    v-model="tenantData.host"
                                                                    :error-messages="
                                                                        vpDefaultOrigin.errors
                                                                    "
                                                                    outlined
                                                                    suffix=".posterlab.co"
                                                                    @change="
                                                                        CheckUrlAvailability(
                                                                            'origin',
                                                                            tenantData.host
                                                                        )
                                                                    "
                                                                >
                                                                    <template slot="append">
                                                                        <VIcon
                                                                            v-if="
                                                                                tenantData.host &&
                                                                                urlIconInfo ===
                                                                                    'valid' &&
                                                                                vpDefaultOrigin
                                                                                    .errors
                                                                                    .length === 0
                                                                            "
                                                                            color="rgba(136,197,135,255)"
                                                                            >mdi-checkbox-marked-circle
                                                                        </VIcon>
                                                                        <FontAwesomeIcon
                                                                            v-if="
                                                                                urlIconInfo ===
                                                                                'invalid'
                                                                            "
                                                                            size="lg"
                                                                            color="orange"
                                                                            :icon="
                                                                                icons.faExclamationCircle
                                                                            "
                                                                        />
                                                                    </template>
                                                                </VTextField>
                                                            </ValidationProvider>
                                                        </VCol>
                                                        <VCol class="tw-py-0">
                                                            <div>Your logo (optional)</div>
                                                            <VFileInput
                                                                v-model="logo"
                                                                accept="image/*"
                                                                outlined
                                                                clearable
                                                                persistent-hint
                                                                @change="uploadLogo"
                                                            />
                                                            <template slot="append">
                                                                <VIcon
                                                                    v-if="logo"
                                                                    color="rgba(136,197,135,255)"
                                                                    >mdi-checkbox-marked-circle
                                                                </VIcon>
                                                            </template>
                                                        </VCol>
                                                    </VRow>
                                                    <VRow dense>
                                                        <VCol class="tw-py-0">
                                                            <ValidationProvider
                                                                v-slot="vpTermsAndConditions"
                                                                name="Terms and Conditions"
                                                                :rules="{
                                                                    required: { allowFalse: false },
                                                                }"
                                                                mode="eager"
                                                                slim
                                                                class="tw-py-0"
                                                            >
                                                                <VCheckbox
                                                                    id="termsAndConditions"
                                                                    v-model="
                                                                        tenantData.termsAndConditions
                                                                    "
                                                                    :error-messages="
                                                                        vpTermsAndConditions.errors
                                                                    "
                                                                    dense
                                                                >
                                                                    <template #label>
                                                                        I accept the &nbsp;
                                                                        <a
                                                                            target="_blank"
                                                                            :href="
                                                                                termsAndConditionsUrl
                                                                            "
                                                                            class="tw-no-underline"
                                                                            @click.stop
                                                                        >
                                                                            Terms and Conditions
                                                                        </a>
                                                                        &nbsp; and have read the
                                                                        &nbsp;
                                                                        <a
                                                                            target="_blank"
                                                                            :href="privacyPolicyUrl"
                                                                            class="tw-no-underline"
                                                                            @click.stop
                                                                        >
                                                                            Privacy Policy
                                                                        </a>
                                                                        &nbsp; of PosterLab
                                                                    </template>
                                                                </VCheckbox>
                                                            </ValidationProvider>
                                                        </VCol>
                                                    </VRow>
                                                    <VCardActions class="tw-justify-center tw-pb-5">
                                                        <VBtn
                                                            :loading="buttonLoading"
                                                            color="primary"
                                                            type="submit"
                                                            @click.prevent="
                                                                handleSubmit(handleCreateTenant)
                                                            "
                                                            >Create Event
                                                        </VBtn>
                                                    </VCardActions>
                                                </VCard>
                                            </VCol>
                                        </VRow>
                                    </VCardText>
                                </ValidationObserver>
                            </VCard>
                        </VStepperContent>
                    </VStepperItems>
                </VStepper>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import {
    faArrowRight,
    faCheckCircle,
    faInfoCircle,
    faExclamationCircle,
} from '@fortawesome/pro-solid-svg-icons'
import { onMounted, reactive, ref } from '@vue/composition-api'
import { defineComponent, useContext, useRoute, useRouter } from '@nuxtjs/composition-api'
import useCreateTenant from '~/composables/tenant/useCreateTenant'
import useIcons from '~/composables/common/useIcons'
import { FloatingBannerEnum } from '~/types/banner'
import { LoginForm } from '~/components/auth/AuthLoginForm.vue'

export default defineComponent({
    layout: 'event',
    auth: false,

    setup() {
        const { $accessor, $auth } = useContext()
        const route = useRoute()
        const router = useRouter()
        const { handlePostTenant, checkUniqueParam, uploadFile } = useCreateTenant()
        const { icons } = useIcons({
            faArrowRight,
            faCheckCircle,
            faInfoCircle,
            faExclamationCircle,
        })

        // Refs
        const step = ref(1)
        const hasAccount = ref(false)
        const signedIn = ref(false)
        const registered = ref(false)
        const editable = ref(true)
        const customizationEditable = ref(false)
        const tenantData = reactive({
            name: '',
            host: '',
            termsAndConditions: false,
            logo: {},
        })
        const domainSuffix = ref('.pl-dev.de')
        const logo = ref()
        const logoId = ref()
        const hint = ref('Event registration is open to everyone')
        const urlIconInfo = ref('')
        const buttonLoading = ref(false)

        const privacyPolicyUrl = process.env.privacyPolicyUrl
        const termsAndConditionsUrl = process.env.termsAndConditionUrl

        async function logout() {
            await $auth.logout()
            signedIn.value = false
        }

        function postLoginHandler(_form: LoginForm): void {
            signedIn.value = $auth.loggedIn
            step.value = 2
            editable.value = true
        }

        function postRegisterHandler(_form: LoginForm): void {
            registered.value = true
            router.push({
                path: '/auth/confirm-email',
                query: {
                    email: _form?.email,
                    step: 'event',
                },
            })
        }

        async function uploadLogo() {
            if (logo && logo.value.size > 5242880)
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.error,
                    message: 'Maximum logo size is 5 Mb',
                })
            if (logo) {
                const res = await uploadFile(logo.value)
                logoId.value = res?.data.id
            }
        }

        async function handleCreateTenant(): Promise<void> {
            buttonLoading.value = true
            const subDomain = tenantData.host + domainSuffix.value
            if (logoId) tenantData.logo = { id: logoId.value }
            const input = {
                ...tenantData,
                host: subDomain,
            }

            if (await handlePostTenant(input))
                window.open('https://' + subDomain + '/auth/login?first=true', '_self')
        }

        onMounted(_updateValues)

        function _updateValues() {
            if (window.location.host.includes('.posterlab.co')) domainSuffix.value = '.posterlab.co'
            else if (window.location.host.includes('-staging.pl-dev.de')) {
                const domainParts = window.location.host.split('.')
                domainSuffix.value =
                    '.' +
                    domainParts[domainParts.length - 3] +
                    '.' +
                    domainParts[domainParts.length - 2] +
                    '.' +
                    domainParts[domainParts.length - 1]
            }

            if (route.value.query.register === 'true')
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.success,
                    message: 'Your email has been confirmed',
                })
            if ($auth.loggedIn) {
                step.value = 2
            }

            const confirmed = route.value.query.confirmed
            hasAccount.value = route.value.query.register === 'true'
            if (typeof confirmed === 'string' && confirmed === 'true') {
                step.value = 4
                editable.value = false
            }
        }

        async function CheckUrlAvailability(type, value) {
            if (await checkUniqueParam(type, value + domainSuffix.value)) {
                urlIconInfo.value = 'invalid'
            } else {
                urlIconInfo.value = 'valid'
            }
        }

        return {
            step,
            hasAccount,
            signedIn,
            registered,
            editable,
            customizationEditable,
            tenantData,
            logo,
            hint,
            privacyPolicyUrl,
            termsAndConditionsUrl,
            urlIconInfo,
            buttonLoading,
            logout,
            postLoginHandler,
            postRegisterHandler,
            handleCreateTenant,
            uploadLogo,
            CheckUrlAvailability,
            icons,
        }
    },
})
</script>
