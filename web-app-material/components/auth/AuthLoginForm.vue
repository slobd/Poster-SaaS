<template>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }" tag="form" data-cy="login">
        <VRow no-gutters>
            <VCol cols="12">
                <div>Your email</div>
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
                        name="password"
                        :error-messages="vpPassword.errors"
                        autocomplete="current-password"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword"
                    />
                </ValidationProvider>
                <div class="tw-text-xs">
                    <a href="/auth/forgot-password">Forgotten password</a>
                </div>
            </VCol>
            <VCol cols="12" class="tw-flex tw-justify-center">
                <VBtn
                    class="tw-mt-4 tw-w-32 tw-h-10"
                    color="primary"
                    type="submit"
                    @click.prevent="handleSubmit(submit)"
                >
                    {{ submitBtnText }}
                </VBtn>
            </VCol>
        </VRow>
    </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropType } from 'vue/types'
import { ValidationObserver } from 'vee-validate'
import { LoginState } from '~/types/auth'

const form = {
    email: '',
    password: '',
}

export type LoginForm = typeof form

export default Vue.extend({
    name: 'AuthLoginForm',
    auth: 'guest',
    layout: 'auth',

    props: {
        postSubmitHandle: {
            type: Function as PropType<(form: LoginForm) => void>,
            required: false,
            default() {},
        },
        submitBtnText: {
            type: String,
            default: 'log in',
        },
        to: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            form,
            showPassword: false,
            loginState: LoginState,
        }
    },

    methods: {
        async submit(): Promise<void> {
            try {
                await this.$auth.loginWith('local', {
                    data: {
                        email: this.form.email,
                        password: this.form.password,
                    },
                    params: this.$route.query,
                })
                this.postSubmitHandle(this.form)
                if (this.to) this.$router.push({ path: this.to })

                if (this.$accessor.getAfterLoginPath) {
                    this.$router.push(this.$accessor.getAfterLoginPath)
                    // Reset afterLoginPath after natigation
                    this.$accessor.setAfterLoginPath('')
                }
            } catch (error) {
                this.$logger.error(error)
                const observer = this.$refs.observer as InstanceType<typeof ValidationObserver>
                if (error.response && error.response.status === 400) {
                    observer.setErrors(error.response.data.error)
                } else if (error.response && error.response.status === 401) {
                    observer.setErrors({
                        email: ['Incorrect email or password'],
                        password: ['Incorrect email or password'],
                    })
                }
            }
        },
    },
})
</script>

<style></style>
