<template>
    <VDialog v-model="dialog" persistent max-width="800px">
        <template #activator="{ on, attrs }">
            <slot name="activator" v-bind="{ on, attrs }"></slot>
        </template>
        <VCard>
            <VCardTitle class="text-h5 tw-justify-center tw-text-center">
                Interested to collaborate with me or our research team?
            </VCardTitle>
            <span class="tw-text-center">
                <p>Please fill out this form to send your request.</p>
            </span>
            <VRow class="tw-m-5 tw-mb-0">
                <ValidationObserver
                    ref="observer"
                    v-slot="{ handleSubmit }"
                    tag="form"
                    data-cy="login"
                >
                    <VCol class="d-flex" cols="12">
                        <ValidationProvider
                            v-slot="vpOccupation"
                            name="Occupation"
                            rules="required"
                            mode="eager"
                            slim
                        >
                            <VSelect
                                v-model="occupation"
                                :items="occupations"
                                outlined
                                label="Select your occupation type"
                                :error-messages="vpOccupation.errors"
                            ></VSelect>
                        </ValidationProvider>
                    </VCol>
                    <VCol cols="12">
                        <p>
                            Help me to know a little about your question or collaboration interests
                            (min. 1 option)
                        </p>
                        <ValidationProvider
                            v-slot="{ errors }"
                            vid="questions"
                            mode="eager"
                            name="Question"
                            slim
                        >
                            <div v-for="question in questions" :key="question.id">
                                <VCheckbox
                                    id="privacyPolicy"
                                    v-model="question.value"
                                    class="tw-mt-0"
                                    dense
                                >
                                    <template #label>
                                        {{ question.text }}
                                    </template>
                                </VCheckbox>
                                <span
                                    v-for="error in errors"
                                    :key="error"
                                    class="tw-text-red-700 tw-mt-2"
                                    >{{ error }}</span
                                >
                            </div>
                        </ValidationProvider>
                    </VCol>
                    <VCol cols="12" class="tw-flex tw-justify-center">
                        <VBtn
                            color="primary"
                            class="tw-mx-5"
                            @click.prevent="handleSubmit(expertRequestCollaboration)"
                        >
                            Send request
                        </VBtn>
                        <VBtn color="secondary" @click="$emit('close', false)"> Cancel </VBtn>
                    </VCol>
                </ValidationObserver>
            </VRow>
        </VCard>
    </VDialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
import { APIRoutes } from '~/types/typing'
import { User } from '~/types/entities/User.entity'

export default defineComponent({
    name: 'UserRequestCollaborationModal',
    props: {
        input: {
            type: Boolean,
            default: true,
        },
        user: {
            type: Object as PropType<User>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const occupations = ref(['Researcher', 'Investor', 'Corporation'])
        const occupation = ref('')
        const questions = ref([
            {
                id: 1,
                text: 'I would like to get in touch privately',
                value: false,
            },
            {
                id: 2,
                text: 'I am interested in collaborating',
                value: false,
            },
            {
                id: 3,
                text: 'I have other questions',
                value: false,
            },
        ])
        const requestSend = ref(false)
        const dialog = props.input

        const { $axios, $accessor, $logger } = useContext()

        const response = computed(() => {
            return questions.value.filter((x) => x.value === true).map((x) => x.text)
        })

        async function expertRequestCollaboration() {
            const requestBody = {
                jobCategory: occupation.value,
                questions: response.value,
                receiver: {
                    firstName: props.user.firstName,
                    lastName: props.user.lastName,
                    email: props.user.email,
                },
            }

            try {
                await $axios.$post(APIRoutes.REQUEST_COLLABORATION, requestBody)
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'success',
                    message: 'Your request collaboration has been sent',
                })
                emit('close', false)
            } catch (error) {
                $logger.error(error)
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'error',
                    message: 'There was an error while trying to send the request',
                })
            }
        }

        return {
            occupations,
            occupation,
            questions,
            response,
            requestSend,
            dialog,
            expertRequestCollaboration,
        }
    },
})
</script>
