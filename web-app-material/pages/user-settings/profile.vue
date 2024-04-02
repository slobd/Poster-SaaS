<template>
    <div class="tw-grid tw-grid-cols-12 tw-gap-x-6">
        <div class="md:tw-col-span-6 tw-col-span-12">
            <ValidationObserver v-slot="{ handleSubmit }" ref="observer" slim>
                <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
                    <div class="lg:tw-col-span-1 tw-col-span-2">
                        <ValidationProvider
                            v-slot="{ errors }"
                            mode="eager"
                            rules="required"
                            name="First Name"
                            slim
                        >
                            <VTextField
                                v-model="form.firstName"
                                label="First Name"
                                :error-messages="errors"
                                outlined
                                dense
                            />
                        </ValidationProvider>
                    </div>
                    <div class="lg:tw-col-span-1 tw-col-span-2">
                        <ValidationProvider
                            v-slot="{ errors }"
                            mode="eager"
                            rules="required"
                            name="Last Name"
                            slim
                        >
                            <VTextField
                                v-model="form.lastName"
                                label="Last Name"
                                :error-messages="errors"
                                outlined
                                dense
                            />
                        </ValidationProvider>
                    </div>
                </div>
                <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
                    <div class="lg:tw-col-span-1 tw-col-span-2">
                        <VTextField
                            v-model="form.organizationName"
                            label="Organization"
                            placeholder=""
                            persistent-placeholder
                            outlined
                            dense
                        />
                    </div>
                    <div class="lg:tw-col-span-1 tw-col-span-2">
                        <VTextField
                            :value="$auth.user.email"
                            label="E-Mail"
                            outlined
                            dense
                            disabled
                        />
                    </div>
                </div>
                <VTextField
                    v-if="form.role"
                    v-model="form.role"
                    label="Your role in the Workspace"
                    outlined
                    disabled
                    dense
                />
                <a
                    v-if="isLocalAccount"
                    :href="passwordResetUrl"
                    class="text-decoration-underline tw-text-black tw-text-xs"
                >
                    Reset Password
                </a>
                <VCheckbox
                    v-model="form.disableNotifications"
                    label="Disable chat email notifications"
                    messages="Select to not receive email notifications for each new comment
                    inserted in your documents"
                    class="disable-email-notif"
                />

                <h2 class="tw-text-sm tw-pt-6 tw-pb-4">Social links</h2>
                <div class="tw-flex">
                    <FontAwesomeIcon
                        class="social-link-icon grey--text text--darken-3"
                        :icon="icons.faLinkedin"
                    />
                    <ValidationProvider
                        v-slot="{ errors }"
                        mode="eager"
                        :rules="{ regex: /^(http|https)/ }"
                        name="Linkedin"
                        slim
                    >
                        <VTextField
                            v-model="form.linkedin"
                            label="Linkedin"
                            :error-messages="errors"
                            outlined
                            dense
                        />
                    </ValidationProvider>
                </div>
                <div class="tw-flex">
                    <FontAwesomeIcon
                        class="social-link-icon grey--text text--darken-3"
                        :icon="icons.faResearchgate"
                    />
                    <ValidationProvider
                        v-slot="{ errors }"
                        mode="eager"
                        :rules="{ regex: /^(http|https)/ }"
                        name="ResearchGate"
                        slim
                    >
                        <VTextField
                            v-model="form.researchGate"
                            label="ResearchGate"
                            :error-messages="errors"
                            outlined
                            dense
                        />
                    </ValidationProvider>
                </div>
                <div class="tw-flex">
                    <FontAwesomeIcon
                        class="social-link-icon grey--text text--darken-3"
                        :icon="icons.faTwitter"
                    />
                    <ValidationProvider
                        v-slot="{ errors }"
                        mode="eager"
                        :rules="{ regex: /^(http|https)/ }"
                        name="Twitter"
                        slim
                    >
                        <VTextField
                            v-model="form.twitter"
                            label="Twitter"
                            :error-messages="errors"
                            outlined
                            dense
                        />
                    </ValidationProvider>
                </div>
                <VBtn
                    class="mt-5 tw-text-left"
                    color="primary"
                    depressed
                    @click.prevent="handleSubmit(saveProfileChanges)"
                >
                    Save changes
                </VBtn>
            </ValidationObserver>
        </div>
        <div class="md:tw-col-span-6 tw-col-span-12">
            <MyProfileUpdateAvatar></MyProfileUpdateAvatar>
        </div>
    </div>
</template>

<script lang="ts">
import { faLinkedin, faResearchgate, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { ValidationObserver } from 'vee-validate'
import { defineComponent, ref } from '@nuxtjs/composition-api'
import flow from 'lodash/flow'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'
import { FloatingBannerEnum } from '~/types/banner'
import { User } from '~/types/entities/User.entity'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    setup() {
        const { icons } = useIcons({
            faLinkedin,
            faResearchgate,
            faTwitter,
        })
        const passwordResetUrl = ref(process.env.passwordResetUrl)
        return {
            icons,
            passwordResetUrl,
        }
    },
    data() {
        return {
            form: {
                firstName: this.$auth.user.firstName ? this.$auth.user.firstName : '',
                lastName: this.$auth.user.lastName ? this.$auth.user.lastName : '',
                organizationName: this.$auth.user.organizationName
                    ? this.$auth.user.organizationName
                    : '',
                role: '',
                disableNotifications: this.$auth.user.disableNotifications
                    ? this.$auth.user.disableNotifications
                    : false,
                linkedin: this.$auth.user.linkedin ? this.$auth.user.linkedin : '',
                researchGate: this.$auth.user.researchGate ? this.$auth.user.researchGate : '',
                twitter: this.$auth.user.twitter ? this.$auth.user.twitter : '',
            },
        }
    },
    
    fetch(): void {
        const role = this.$auth.user.roles?.filter((x) => x.tenantId === this.getTenantId)
        if (role) this.form.role = role[0].name
    },
    
    computed: {
        getTenantId() {
            return this.$accessor.tenant.getTenantId
        },
        userRole(): string {
            return this.$accessor.myprofile.getCurrentRole
                ? this.$accessor.myprofile.getCurrentRole.name
                : 'GUEST'
        },
        isLocalAccount(): boolean {
            const userAccount = this.$auth.user.userAccount.find(
                (x) => x?.identityProvider?.name === 'local'
            )

            return !!userAccount
        },
    },
    
    methods: {
        async saveProfileChanges(): Promise<void> {
            try {
                await this.$accessor.myprofile.updateProfile({
                    user: {
                        firstName: this.form.firstName,
                        lastName: this.form.lastName,
                        organizationName: this.form.organizationName,
                        disableNotifications: this.form.disableNotifications,
                        linkedin: this.form.linkedin,
                        researchGate: this.form.researchGate,
                        twitter: this.form.twitter,
                    } as User,
                })

                await this.$auth.fetchUser()

                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'success',
                    message: 'Profile updated successfully.',
                })
            } catch (error) {
                this.setErrorBanner(error, 'Error while saving')
            }
        },

        setErrorBanner(error, message): void {
            if (error.response && error.response.status === 400) {
                const observer = this.$refs.observer as InstanceType<typeof ValidationObserver>
                observer.setErrors(error.response.data.error)
            }

            this.$accessor.banner.setBanner({
                type: FloatingBannerEnum.error,
                message,
                value: true,
            })
        },

        removeEmptyKeyFromObject(obj: Record<string, any>) {
            return flow(
                (o) => omitBy(o, isNil),
                (o) => omitBy(o, (val) => val === '')
            )(obj)
        },
    },
})
</script>

<style scoped>
.disable-email-notif >>> .v-label {
    @apply tw-text-xs tw-text-black;
}
.social-link-icon {
    @apply tw-mr-3 tw-mt-3 tw-text-xl;
}
</style>
