<template>
    <div class="page-wrapper grey lighten-4">
        <WebMetadata />
        <div class="page-header tw-py-2 tw-px-10">
            <h1 class="tw-font-bold tw-text-lg">Gallery</h1>
            <VSpacer />
            <VTextField
                v-model="search"
                class="gallery-search-input tw-max-w-xs"
                placeholder="Author, Organizations..."
                clearable
                dense
                :hide-details="true"
                @keydown.enter.prevent="fetchPosters"
                @click:clear="clearSearch"
            >
                <template #prepend-inner>
                    <FontAwesomeIcon
                        class="tw-text-gray-400 tw-mr-2"
                        fixed-width
                        :icon="icons.faSearch"
                    />
                </template>
            </VTextField>
            <VBtn
                v-if="$can('create', caslPoster)"
                color="primary"
                small
                depressed
                class="ml-4"
                :to="`/workspace/${workspaceId}/upload/new?step=1`"
            >
                <FontAwesomeIcon fixed-width :icon="icons.faUpload" class="tw-mr-1" />
                Upload
            </VBtn>
        </div>
        <VDivider />

        <div class="grey lighten-3 tw-flex tw-px-10 tw-items-center">
            <VRadioGroup v-model="visibility" row>
                <div class="tw-mr-3"><strong>Filter </strong></div>

                <VRadio label="All documents" :value="PosterVisibilityEnum.PUBLIC" />
                <VRadio label="My documents" :value="PosterVisibilityEnum.PRIVATE" />
            </VRadioGroup>
            <VSpacer />

            <p class="tw-mb-0 tw-mr-4 tw-mt-4 tw-mb-4 tw-font-bold tw-text-sm tw-opacity-60">
                <strong>View mode:</strong>
            </p>
            <VBtnToggle v-model="layout" mandatory dense>
                <VBtn :value="1" text>
                    <FontAwesomeIcon fixed-width size="lg" :icon="icons.faGripHorizontal" />
                </VBtn>

                <VBtn :value="2" text>
                    <FontAwesomeIcon fixed-width :icon="icons.faThList" />
                </VBtn>
            </VBtnToggle>
        </div>

        <div class="tw-py-5 tw-px-10">
            <div v-if="galleryPosters && galleryPosters.length">
                <VRow v-if="showGallery.grid">
                    <VCol v-for="(poster, i) in galleryPosters" :key="i" cols="6" md="3">
                        <GalleryDocumentCard :poster="poster" />
                    </VCol>
                </VRow>
                <GalleryList v-else-if="showGallery.table" :posters="posters" />
            </div>
            <NoContentDialog v-else />
        </div>
    </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGripHorizontal, faThList, faUpload, faSearch } from '@fortawesome/pro-solid-svg-icons'
import { computed, defineComponent, useContext, useFetch, watch } from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'
import { GalleryLayout } from '~/constants/gallery.constants'
import useIcons from '~/composables/common/useIcons'
import useGallery from '~/composables/gallery/useGallery'
import useGalleryUI from '~/composables/gallery/useGalleryUI'
import useAuthUtil from '~/composables/common/useAuthUtil'

export default defineComponent({
    name: 'GalleryIndex',
    components: {
        FontAwesomeIcon,
    },
    setup() {
        // Use composables
        const { icons } = useIcons({
            faGripHorizontal,
            faThList,
            faUpload,
            faSearch,
        })
        const { posters, visibility, search, fetchPosters } = useGallery()
        const { showGallery, layout } = useGalleryUI()
        const { isTenantMember } = useAuthUtil()
        const { fetch } = useFetch(fetchPosters)
        const { $accessor } = useContext()

        watch([visibility], ([newVisibility], [oldVisibility]) => {
            if (oldVisibility !== newVisibility) fetch()
        })

        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

        const galleryPosters = computed(() => {
            return posters.value
        })

        const caslPoster = computed(() =>
            subject('Poster', {
                workspace: { id: $accessor.workspace.getWorkspaceId },
            })
        )

        function clearSearch() {
            search.value = ''
            fetch()
        }

        /**
         * For the warning: [Vue warn]: Write operation failed: computed value is readonly.
         * See: https://github.com/nuxt-community/composition-api/issues/19
         */
        return {
            // Refs
            visibility,
            posters,
            search,
            layout,
            isTenantMember,
            // Const
            PosterVisibilityEnum,
            GalleryLayout,
            // Computed
            showGallery,
            icons,
            galleryPosters,
            workspaceId,
            caslPoster,
            // Methods
            fetchPosters: fetch,
            clearSearch,
        }
    },
})
</script>

<style lang="scss">
.gallery-search-input {
    .v-input__prepend-inner {
        align-self: center;
    }
}
</style>
