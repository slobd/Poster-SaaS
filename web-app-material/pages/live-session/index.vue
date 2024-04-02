<template>
    <VContainer fluid class="grey lighten-4 tw-h-full tw-p-0">
        <WebMetadata />
        <div class="white tw-flex tw-justify-between tw-py-6 tw-px-10">
            <h1 class="text-h5">Live Session</h1>
            <VSpacer />
            <VBtn v-if="isModerator" color="primary" class="" to="/live-session/create-session">
                Start New Session
            </VBtn>
        </div>
        <NoContentDialog v-if="onGoingSessions.length === 0" />
        <div>
            <VRow no-gutters class="tw-flex tw-flex-col tw-flex-grow-0">
                <VCol
                    v-for="(session, i) in onGoingSessions"
                    :key="i"
                    class="tw-p-5"
                    cols="12"
                    md="4"
                >
                    <SessionCard :admin="isModerator" :session="session" @close="closeSession" />
                </VCol>
            </VRow>
        </div>
    </VContainer>
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
import { User } from '~/types/entities/User.entity'
import { ILiveSession } from '~/types/liveSession'
import { APIRoutes } from '~/types/typing'

export interface LiveSession {
    id: number
    roomName: string
    slug: string
    user: User
}

export default defineComponent({
    setup() {
        const loading = ref(false)
        const onGoingSessions = ref([] as ILiveSession[])
        const sessions = ref([
            {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                userId: 1,
                organizationName: 'PosterLab',
                title: "College Student's Perceived Risk of Diabetes and",
            } as ILiveSession,
        ])
        const interval = ref(null as null | number)
        const router = useRouter()
        const { $axios } = useContext()
        const isModerator = ref(false)
        // computed
        const currentSession = computed(() => {
            if (onGoingSessions.value.length > 0) {
                return onGoingSessions.value[0]
            } else {
                return null
            }
        })

        // methods
        async function _refresh() {
            const response = await $axios.$get(APIRoutes.LIVESESSION)
            onGoingSessions.value = response.data

            if (response.data.length > 0) {
                const session = {
                    id: response.data[0].id,
                    title: response.data[0].roomName,
                    userId: response.data[0].user.id,
                    firstName: response.data[0].user.firstName,
                    lastName: response.data[0].user.lastName,
                    avatar: response.data[0].user.avatar,
                    slug: response.data[0].slug,
                } as ILiveSession
                onGoingSessions.value.push(session)
            }

            isModerator.value = await $axios.$post(APIRoutes.IAM_CAN_USER, {
                resource: 'LIVE_SESSION',
                action: 'CREATE',
            })
        }

        async function closeSession(session: ILiveSession) {
            if (!currentSession) {
                return
            }
            loading.value = true
            await $axios.$post(`${APIRoutes.LIVESESSION}/close`, {
                id: session.id,
            })
            loading.value = false
            onGoingSessions.value = []
        }

        function sessionLink(session: ILiveSession) {
            return router.resolve(`${APIRoutes.LIVESESSION}/${session.slug || ''}`).href
        }

        onMounted(async () => {
            await _refresh()
            loading.value = false
            if (!interval.value) {
                interval.value = setInterval(() => {
                    _refresh()
                }, 10000) as unknown as number
            }
        })

        return {
            loading,
            currentSession,
            sessions,
            onGoingSessions,
            isModerator,
            sessionLink,
            closeSession,
        }
    },
})
</script>
