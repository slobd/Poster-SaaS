<template>
    <div>
        <WebMetadata />
        <VContainer v-if="!showMode" fluid class="grey lighten-4 tw-h-full tw-px-10">
            <div class="tw-flex tw-items-center tw-my-4">
                <h3 class="grey--text text--darken-3 tw-font-medium tw-text-xl tw-leading-6">
                    <span class="grey--text text--lighten-1 tw-mr-3"
                        ><FontAwesomeIcon :icon="icons.faFileAlt"
                    /></span>
                    {{ poster.title }}
                    <VisibilityChip :name="visibility" />
                </h3>

                <VSpacer />
                <VBtn text>
                    <nuxt-link
                        :to="`/workspace/${workspaceId}/gallery`"
                        class="
                            grey--text
                            text--darken-3
                            tw-text-base tw-normal-case tw-no-underline
                        "
                    >
                        <FontAwesomeIcon :icon="icons.faArrowLeft" />
                        Gallery
                    </nuxt-link>
                </VBtn>
            </div>

            <VToolbar dense elevation="1">
                <VTabs>
                    <VTab v-for="link in links" :key="link.text" :to="link.to">
                        {{ link.text }}
                    </VTab>
                </VTabs>

                <VDivider class="mx-2" vertical></VDivider>
                <VBtn
                    text
                    :to="`/workspace/${workspaceId}/gallery/${poster.id}/show-mode`"
                    @click="openShowMode"
                    >Show mode
                </VBtn>

                <VDivider class="mx-2" vertical></VDivider>

                <!-- <GalleryShareMenu>
                                <template #activator="{ on, attrs }">
                                    <VBtn icon v-bind="attrs" title="Share" v-on="on">
                                        <FontAwesomeIcon :icon="icons.faShareAlt" />
                                    </VBtn>
                                </template>
                            </GalleryShareMenu> -->

                <VBtn v-if="$can('update', caslPoster)" icon :to="editPath" title="Edit">
                    <FontAwesomeIcon :icon="icons.faEdit" />
                </VBtn>

                <GalleryDeleteDialog v-if="$can('delete', caslPoster)">
                    <template #activator="{ on, attrs }">
                        <VBtn v-bind="attrs" icon title="Delete" v-on="on">
                            <FontAwesomeIcon :icon="icons.faTrashAlt" />
                        </VBtn>
                    </template>
                </GalleryDeleteDialog>
            </VToolbar>

            <VRow class="tw-mt-0" style="min-height: calc(100vh - 8rem)">
                <VCol cols="4" md="3">
                    <GalleryDocumentInfoCard :workspace-id="workspaceId" :document="poster" />
                </VCol>
                <VCol cols="8" md="9">
                    <NuxtChild />
                </VCol>
            </VRow>
        </VContainer>

        <VContainer v-if="showMode" fluid class="tw-h-screen tw-p-0">
            <VRow class="tw-bg-inherit">
                <VCol cols="12" class="tw-pb-0">
                    <NuxtChild />
                </VCol>
            </VRow>
        </VContainer>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, useContext, useRoute } from '@nuxtjs/composition-api'
import {
    faArrowLeft,
    faEdit,
    faFileAlt,
    faShareAlt,
    faTrashAlt,
} from '@fortawesome/pro-solid-svg-icons'
import { subject } from '@casl/ability'
import useIcons from '~/composables/common/useIcons'
import usePoster from '~/composables/gallery/usePoster'

interface ILink {
    text: string
    to: string
}

export default defineComponent({
    setup() {
        const { icons } = useIcons({
            faEdit,
            faTrashAlt,
            faShareAlt,
            faFileAlt,
            faArrowLeft,
        })
        const { poster, showMode, openShowMode } = usePoster()
        const { $accessor } = useContext()
        const route = useRoute()

        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

        if (workspaceId.value !== null) {
            onMounted(async () => {
                await $accessor.gallery.fetchPoster({
                    workspaceId: workspaceId.value as number,
                    posterId: route.value.params.posterId,
                })
                await $accessor.iam.fetchRules({
                    subject: 'Poster',
                    options: {
                        id: poster.value.id,
                    },
                })
            })
        }

        if (route.value.path.includes('show-mode') && !$accessor.gallery.showMode) openShowMode()

        const editPath = computed(() => `/workspace/${workspaceId.value}/upload/${poster.value.id}`)
        const visibility = computed(() => {
            return poster.value.visibility ? poster.value.visibility : ''
        })
        const links = computed<ILink[]>(() => {
            return [
                {
                    text: 'Document',
                    to: `/workspace/${workspaceId.value}/gallery/${poster.value.id}/document`,
                },
                {
                    text: 'abstract',
                    to: `/workspace/${workspaceId.value}/gallery/${poster.value.id}/abstract`,
                },
                {
                    text: 'Authors',
                    to: `/workspace/${workspaceId.value}/gallery/${poster.value.id}/authors`,
                },
                {
                    text: 'Related Documents',
                    to: `/workspace/${workspaceId.value}/gallery/${poster.value.id}/related`,
                },
            ]
        })
        const caslPoster = computed(() => subject('Poster', poster.value))

        return {
            icons,
            showMode,
            poster,
            openShowMode,
            editPath,
            visibility,
            links,
            workspaceId,
            caslPoster,
        }
    },
})
</script>
