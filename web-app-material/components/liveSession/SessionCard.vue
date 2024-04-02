<template>
    <VCard v-if="session.title" max-width="340" min-height="140" outlined class="elevation-2">
        <VListItem three-line>
            <VListItemContent>
                <VRow class="tw-p-3">
                    <div
                        class="
                            tw-flex
                            tw-row
                            tw-rounded-l
                            tw-rounded-r
                            tw-bg-red-500
                            tw-w-5
                            tw-h-3
                            tw-mt-2
                            tw-justify-center
                            tw-items-center
                        "
                    >
                        <FontAwesomeIcon
                            :icon="icons.faVideo"
                            color="white"
                            class="tw-w-2 tw-h-2"
                            fixed-width
                        />
                    </div>
                    <p class="tw-m-1 tw-text-sm tw-font-medium">RUNNING NOW</p>
                </VRow>
                <VListItemTitle class="text-h6 tw-leading-none">
                    {{ session.title }}
                </VListItemTitle>
                <VRow class="tw-p-3 tw-mt-2">
                    <ProfileImage :user="session" :size="ProfileImageSizeEnum.xl" />
                    <VRow>
                        <VCol>
                            <small v-if="session.title" class="tw-text-gray-700 tw-ml-5">
                                {{ session.firstName }} {{ session.lastName }}
                            </small>

                            <VCardActions class="tw-mt-1 tw-py-0">
                                <VBtn
                                    :to="`/experts/${session.userId}/profile`"
                                    outlined
                                    rounded
                                    text
                                    small
                                    class="tw-no-underline tw-tracking-normal tw-px-5"
                                >
                                    profile
                                </VBtn>
                            </VCardActions>
                        </VCol>
                    </VRow>
                </VRow>
            </VListItemContent>
        </VListItem>
        <VRow class="tw-p-8 tw-justify-between">
            <NuxtLink :to="sessionLink">
                <VBtn nuxt color="primary"> Join the session </VBtn>
            </NuxtLink>
            <VBtn v-if="admin" color="secondary" @click="confirmExit"> Close </VBtn>
        </VRow>
        <ExitDialogue
            v-if="closePrompt"
            :input="closePrompt"
            @confirm="$emit('close', session)"
            @stay="closePrompt = $event"
        />
    </VCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useRouter } from '@nuxtjs/composition-api'
import { faVideo } from '@fortawesome/pro-solid-svg-icons'
import { ProfileImageSizeEnum } from '~/types/profileImageSize'
import { ILiveSession } from '~/types/liveSession'
import useIcons from '~/composables/common/useIcons'
import { APIRoutes } from '~/types/typing'

export default defineComponent({
    name: 'SessionCard',
    props: {
        session: {
            type: Object as PropType<ILiveSession>,
            required: true,
        },
        admin: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const { icons } = useIcons({
            faVideo,
        })
        const closePrompt = ref(false)
        const router = useRouter()
        const sessionLink = computed(() => {
            return router.resolve(`${APIRoutes.LIVESESSION}/${props.session.slug || ''}`).href
        })

        // Method

        function confirmExit() {
            closePrompt.value = true
        }
        return {
            icons,
            closePrompt,
            sessionLink,
            ProfileImageSizeEnum,
            confirmExit,
        }
    },
})
</script>

<style></style>
