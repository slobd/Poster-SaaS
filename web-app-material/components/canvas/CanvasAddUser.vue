<template>
    <div>
        <p class="tw-pt-4 tw-text-xxs">
            {{ title }}
        </p>
        <ValidationObserver v-slot="{ handleSubmit, reset, valid }" slim>
            <div
                class="
                    tw-flex tw-flex-row tw-gap-2 tw-items-center tw-content-center tw-justify-start
                "
            >
                <ValidationProvider
                    v-slot="{ errors }"
                    name="first name"
                    mode="eager"
                    rules="required"
                    slim
                >
                    <VTextField
                        placeholder="First Name*"
                        :maxlength="100"
                        outlined
                        dense
                        class="tw-w-full"
                        :error-messages="errors[0]"
                        name="firstName"
                        :value="form.firstName"
                        @input="(value) => (form.firstName = value)"
                    >
                        <template #append>
                            <FontAwesomeIcon
                                class="tw-text-gray-500 tw-mt-1"
                                :icon="icons.fasUser"
                            />
                        </template>
                    </VTextField>
                </ValidationProvider>
                <ValidationProvider
                    v-slot="{ errors }"
                    name="last name"
                    mode="eager"
                    rules="required"
                    slim
                >
                    <VTextField
                        placeholder="Last Name*"
                        :maxlength="100"
                        outlined
                        dense
                        class="tw-w-full"
                        :error-messages="errors[0]"
                        name="lastName"
                        :value="form.lastName"
                        @input="(value) => (form.lastName = value)"
                    >
                        <template #append>
                            <FontAwesomeIcon
                                class="tw-text-gray-500 tw-mt-1"
                                :icon="icons.fasUser"
                            />
                        </template>
                    </VTextField>
                </ValidationProvider>
                <ValidationProvider
                    v-slot="{ errors, validate }"
                    name="email"
                    mode="eager"
                    rules="required|email"
                    slim
                >
                    <VTextField
                        placeholder="Email*"
                        :error-messages="errors[0]"
                        :maxlength="100"
                        :required="true"
                        outlined
                        dense
                        class="tw-w-full"
                        name="email"
                        :value="form.email"
                        @input="
                            (value) => {
                                if (validate(value)) form.email = value
                            }
                        "
                    >
                        <template #append>
                            <FontAwesomeIcon
                                class="tw-text-gray-500 tw-mt-1"
                                :icon="icons.fasEnvelope"
                            />
                        </template>
                    </VTextField>
                </ValidationProvider>
                <ValidationProvider
                    v-slot="{ errors }"
                    name="organization"
                    mode="eager"
                    rules=""
                    slim
                >
                    <VTextField
                        placeholder="Organization"
                        :maxlength="100"
                        outlined
                        dense
                        :error-messages="errors[0]"
                        class="tw-w-full"
                        name="organization"
                        :value="form.organizationName"
                        @input="(value) => (form.organizationName = value)"
                    >
                        <template #append>
                            <FontAwesomeIcon
                                class="tw-text-gray-500 tw-mt-1"
                                :icon="icons.fasBuilding"
                            />
                        </template>
                    </VTextField>
                </ValidationProvider>
                <VBtn
                    color="primary"
                    class="tw-self-start tw-mt-2"
                    :disabled="!valid"
                    small
                    text
                    @click.prevent="handleSubmit(submitPerson(reset))"
                >
                    <FontAwesomeIcon size="lg" class="tw-pr-1" :icon="icons.fasPlus" />
                    <span class="tw-font-bold">Add</span>
                </VBtn>
            </div>

            <p class="tw-mb-2 tw-text-xxs tw-text-pl-gray-5">
                {{ hint }}
            </p>
        </ValidationObserver>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'
import {
    faBuilding as fasBuilding,
    faEnvelope as fasEnvelope,
    faPlus as fasPlus,
    faUser as fasUser,
} from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'AddUser',
    props: {
        title: {
            type: String,
            default: 'Add and invite author',
        },
        hint: {
            type: String,
            default: 'These authors will receive an invitation email',
        },
    },
    setup() {
        const { icons } = useIcons({
            fasUser,
            fasEnvelope,
            fasBuilding,
            fasPlus,
        })
        const form = ref({
            firstName: '',
            lastName: '',
            email: '',
            organizationName: '',
        })
        const organizations = ref(['PosterLab', 'KWT'])

        return {
            icons,
            form,
            organizations,
        }
    },
    methods: {
        submitPerson(reset): void {
            this.$emit('user', this.form)
            this.form = {
                firstName: '',
                lastName: '',
                email: '',
                organizationName: this.form.organizationName,
            }
            reset()
        },
    },
})
</script>
