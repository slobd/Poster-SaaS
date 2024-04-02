<template>
    <VHover v-slot="{ hover }">
        <VCard
            :elevation="hover ? 6 : 1"
            class="tw-cursor-pointer tw-pb-1 rounded-lg tw-relative tw-my-4 tw-text-left"
            height="350"
            :to="`/workspace/${workspaceId}/gallery/${poster.id}/document`"
        >
            <VImg height="200" :alt="poster.title" :src="poster.image && poster.image.location" />
            <VRow>
                <VCol cols="12">
                    <VCardTitle
                        class="
                            overflow-hidden
                            tw-leading-snug tw-break-normal tw-text-base tw-pb-1 tw-h-16
                        "
                    >
                        {{ poster.title }}
                    </VCardTitle>
                    <VisibilityChip class="tw-mb-16 tw-ml-3" :name="visibility" />
                </VCol>
            </VRow>
            <VListItem class="tw-absolute tw-bottom-0 tw-left-0 tw-mb-2">
                <VListItemAvatar>
                    <ProfileImage :user="poster.user" />
                </VListItemAvatar>

                <VListItemContent>
                    <VListItemTitle
                        >{{ poster.user.firstName }} {{ poster.user.lastName }}</VListItemTitle
                    >
                </VListItemContent>
            </VListItem>
        </VCard>
    </VHover>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { Poster } from '~/types/entities/Poster.entity'

export default defineComponent({
    name: 'GalleryDocumentCard',
    props: {
        poster: {
            type: Object as PropType<Poster>,
            default: () => {},
            required: true,
        },
    },
    setup(props) {
        const visibility = computed(() => {
            return props.poster.visibility
        })

        const { $accessor } = useContext()
        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

        return {
            visibility,
            workspaceId,
        }
    },
})
</script>

<style></style>
