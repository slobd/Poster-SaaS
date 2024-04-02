<template>
    <loader v-if="loading" />
    <div v-else class="grey lighten-4 tw-h-full tw-flex tw-flex-col tw-overflow-y-auto">
        <VContainer fluid class="white tw-flex tw-items-center tw-py-6 tw-px-10 tw-justify-between">
            <div>
                <h1 class="text-h5">Live Session</h1>
                <VSpacer />
            </div>
        </VContainer>
        <VDivider />

        <VContainer fluid class="gray tw-h-full tw-flex tw-items-center tw-justify-center">
            <VRow
                no-gutters
                class="tw-flex tw-flex-col tw-items-center tw-flex-grow-0 tw-items-center"
            >
                <VCard v-if="currentSession.id" class="tw-px-4 tw-py-2 tw-text-center">
                    <h3 class="tw-mb-5 tw-text-center">There is an ongoing live video session:</h3>

                    <VCard outlined elevation="2">
                        <VCardTitle class="text-h5 grey lighten-2">
                            {{ `${currentSession.title}` }}
                        </VCardTitle>
                        <VDivider />
                        <VCardActions class="tw-p-2 tw-justify-center tw-items-center">
                            <VRow>
                                <VCol>
                                    <NuxtLink :to="sessionLink">
                                        <VBtn nuxt block color="primary"> Join the session </VBtn>
                                    </NuxtLink>
                                </VCol>
                                <VCol>
                                    <VBtn text>
                                        <nuxt-link
                                            to="/live-session"
                                            class="
                                                grey--text
                                                text--darken-3
                                                tw-text-base tw-normal-case tw-no-underline
                                            "
                                        >
                                            <FontAwesomeIcon :icon="icons.faArrowLeft" />
                                            Back
                                        </nuxt-link>
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCardActions>
                    </VCard>
                </VCard>
                <VCard
                    v-else
                    elevation="1"
                    height="250"
                    class="tw-flex tw-justify-center tw-w-full tw-items-center"
                >
                    <VRow class="">
                        <h3 class="tw-pl-12 tw-pb-2">Start a new live session</h3>
                        <CreateLiveSession v-if="isModerator" />
                        <p v-else>Ask your Account admin to creata a session for you.</p>
                    </VRow>
                </VCard>
            </VRow>
        </VContainer>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    onMounted,
    ref,
    useContext,
    useRouter,
} from '@nuxtjs/composition-api'
import { faArrowLeft } from '@fortawesome/pro-solid-svg-icons'
import { APIRoutes } from '~/types/typing'
import { ILiveSession } from '~/types/liveSession'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    setup() {
        const loading = ref(false)
        const currentSession = ref({} as ILiveSession)
        const isModerator = ref(false)
        // Computed
        const { $axios } = useContext()
        const router = useRouter()
        const { icons } = useIcons({
            faArrowLeft,
        })
        const sessionLink = computed(() => {
            if (currentSession.value)
                return router.resolve(`${APIRoutes.LIVESESSION}/${currentSession.value.slug || ''}`)
                    .href
        })

        // Methods
        async function closeSession() {
            if (!currentSession.value) {
                return
            }
            loading.value = true
            await $axios.$post(`${APIRoutes.LIVESESSION}/close`, {
                id: currentSession.value.id,
            })
            router.push('/live-session')
            loading.value = false
        }

        async function _refresh() {
            const response = await $axios.$get(APIRoutes.LIVESESSION)

            if (response.data.length > 0) {
                currentSession.value = {
                    id: response.data[0].id,
                    title: response.data[0].roomName,
                    userId: response.data[0].user.id,
                    firstName: response.data[0].user.firstName,
                    lastName: response.data[0].user.lastName,
                    avatar: response.data[0].user.avatar,
                    slug: response.data[0].slug,
                } as ILiveSession
            }
            isModerator.value = await $axios.$post(APIRoutes.IAM_CAN_USER, {
                resource: 'LIVE_SESSION',
                action: 'CREATE',
            })
        }

        onMounted(_refresh)

        return {
            loading,
            currentSession,
            isModerator,
            sessionLink,
            icons,
            closeSession,
        }
    },
})
</script>
