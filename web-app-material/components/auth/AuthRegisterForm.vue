<template>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }" tag="form" data-cy="login">
        <VRow>
            <VCol cols="12">
                <div class="tw-flex tw-justify-end tw-text-xs">
                    Already have an account?
                    <VBtn
                        text
                        small
                        class="blue--text darken-1 tw-pb-3"
                        @click="$emit('has-login', true)"
                    >
                        Sign in
                        <FontAwesomeIcon :icon="icons.faArrowRight" />
                    </VBtn>
                </div>
            </VCol>
            <VCol md="6">
                <div>First Name</div>
                <ValidationProvider
                    v-slot="vpFirstName"
                    name="First Name"
                    mode="eager"
                    rules="required"
                    slim
                >
                    <VTextField
                        v-model="form.firstName"
                        outlined
                        name="firstName"
                        :error-messages="vpFirstName.errors"
                        persistent-placeholder
                        hide-details="auto"
                        @keyup.enter="handleSubmit(submit)"
                    ></VTextField>
                </ValidationProvider>
            </VCol>
            <VCol md="6">
                <div>Last Name</div>
                <ValidationProvider
                    v-slot="vpLastName"
                    name="Last Name"
                    mode="eager"
                    rules="required"
                    slim
                >
                    <VTextField
                        v-model="form.lastName"
                        outlined
                        name="lastName"
                        :error-messages="vpLastName.errors"
                        persistent-placeholder
                        hide-details="auto"
                        @keyup.enter="handleSubmit(submit)"
                    ></VTextField>
                </ValidationProvider>
            </VCol>

            <VCol md="12">
                <div>Organization</div>
                <ValidationProvider
                    v-slot="vpOrganization"
                    name="Organization"
                    mode="eager"
                    rules="required"
                    slim
                >
                    <VTextField
                        v-model="form.organization"
                        outlined
                        name="organizationName"
                        :error-messages="vpOrganization.errors"
                        persistent-placeholder
                        hide-details="auto"
                        @keyup.enter="handleSubmit(submit)"
                    ></VTextField>
                </ValidationProvider>
            </VCol>

            <!-- <VCol md="6">
                <div>Phone (Optional)</div>
                <VTextField
                    v-model="form.phone"
                    outlined
                    name="phone"
                    type="number"
                    persistent-placeholder
                    hide-details="auto"
                    @keyup.enter="handleSubmit(submit)"
                ></VTextField>
            </VCol> -->

            <VCol cols="12">
                <div class="tw-flex tw-justify-between">
                    <div>Work email</div>
                </div>
                <ValidationProvider
                    v-slot="vpEmail"
                    name="email"
                    mode="eager"
                    rules="email|required"
                    slim
                >
                    <VTextField
                        v-model="form.email"
                        outlined
                        name="email"
                        :error-messages="vpEmail.errors"
                        persistent-placeholder
                        hide-details="auto"
                    ></VTextField>
                </ValidationProvider>
            </VCol>
            <VCol cols="12">
                <div>Password</div>
                <ValidationProvider
                    v-slot="vpPassword"
                    name="password"
                    mode="eager"
                    rules="required"
                    slim
                >
                    <VTextField
                        v-model="form.password"
                        outlined
                        :type="showPassword ? 'text' : 'password'"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        name="password"
                        hint="At least 8 characters"
                        :error-messages="vpPassword.errors"
                        persistent-placeholder
                        hide-details="auto"
                        autocomplete="current-password"
                        @click:append="showPassword = !showPassword"
                    />
                </ValidationProvider>
            </VCol>

            <VCol dense fluid cols="12">
                <div class="tw-text-xs tw-h-8">
                    <ValidationProvider
                        v-slot="vpTermsAndConditions"
                        name="Terms and Conditions"
                        :rules="{ required: { allowFalse: false } }"
                        mode="eager"
                        slim
                    >
                        <VCheckbox
                            id="termsAndConditions"
                            v-model="form.termsAndConditions"
                            class="tw-mt-0"
                            dense
                            :error-messages="vpTermsAndConditions.errors"
                        >
                            <template #label>
                                I acknowledge the PosterLab's &nbsp;
                                <a
                                    target="_blank"
                                    :href="termsOfUse"
                                    class="tw-no-underline"
                                    @click.stop
                                >
                                    Terms of use
                                </a>
                                <span class="tw-text-red-500">&nbsp;*</span>
                            </template>
                        </VCheckbox>
                    </ValidationProvider>
                </div>
                <div class="tw-text-xs tw-h-7">
                    <ValidationProvider
                        v-slot="vpPrivacyPolicy"
                        name="Privacy Policy"
                        :rules="{ required: { allowFalse: false } }"
                        mode="eager"
                        slim
                    >
                        <VCheckbox
                            id="privacyPolicy"
                            v-model="form.privacyPolicy"
                            class="tw-mt-0"
                            dense
                            :error-messages="vpPrivacyPolicy.errors"
                        >
                            <template #label>
                                I acknowledge the PosterLab's &nbsp;
                                <a
                                    target="_blank"
                                    :href="privacyPolicy"
                                    class="tw-no-underline"
                                    @click.stop
                                >
                                    Privacy Policy
                                </a>
                                <span class="tw-text-red-500">&nbsp;*</span>
                            </template>
                        </VCheckbox>
                    </ValidationProvider>
                </div>
                <div class="tw-flex tw-text-xs">
                    <VCheckbox id="newsletter" v-model="form.subscribed" dense>
                        <template #label> Yes, I would like to receive PosterLab news </template>
                    </VCheckbox>
                </div>
            </VCol>
            <VCol>
                <div class="tw-flex tw-justify-center">
                    <VBtn
                        class="tw-mt-4"
                        color="primary"
                        type="submit"
                        :loading="loading"
                        @click.prevent="handleSubmit(submit)"
                    >
                        {{ submitButton }}
                    </VBtn>
                </div>
            </VCol>
        </VRow>
    </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropType } from 'vue/types'
import { faArrowRight } from '@fortawesome/pro-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { APIRoutes } from '~/types/typing'
import { FloatingBannerEnum } from '~/types/banner'

const form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    phone: '',
    subscribed: false,
    termsAndConditions: false,
    privacyPolicy: false,
}

export type RegisterForm = typeof form

export default Vue.extend({
    name: 'AuthRegisterForm',
    auth: 'guest',

    layout: 'auth',

    props: {
        postSubmitHandle: {
            type: Function as PropType<(form: RegisterForm) => void>,
            required: false,
            default() {},
        },
        submitButton: {
            type: String,
            default: 'Create account',
        },
        query: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            form: {
                ...form,
                firstName: (this.$route.query.firstName as string) ?? '',
                lastName: (this.$route.query.lastName as string) ?? '',
                email: (this.$route.query.email as string) ?? '',
                organization: (this.$route.query.organizationName as string) ?? '',
            },
            showPassword: false,
            termsOfUse: process.env.termsOfUse,
            privacyPolicy: process.env.privacyPolicy,
            loading: false,
        }
    },
    computed: {
        icons(): Record<string, IconDefinition> {
            return {
                faArrowRight,
            }
        },
    },
    methods: {
        async submit(): Promise<void> {
            try {
                this.loading = true
                await this.$axios.$post(
                    APIRoutes.REGISTER + this.query,
                    {
                        firstName: this.form.firstName,
                        lastName: this.form.lastName,
                        email: this.form.email,
                        password: this.form.password,
                        subscribed: this.form.subscribed,
                        privacyPolicy: this.form.privacyPolicy,
                        termOfUse: this.form.termsAndConditions,
                        organizationName: this.form.organization,
                    },
                    { params: this.$route.query }
                )
                this.postSubmitHandle(this.form)
            } catch (error) {
                this.loading = false
                let message =
                    'There is already an account registered with this email. To continue please sign in.'
                if (error.response.data.error?.email) message = error.response.data.error?.email[0]
                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.default,
                    message,
                })
            } finally {
                this.loading = false
            }
        },
    },
})
</script>

<style>
.my-checkbox .template {
    font-size: 10px;
}
</style>
