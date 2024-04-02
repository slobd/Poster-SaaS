<template>
    <VContainer class="">
        <VCard
            v-if="posters.length > 0"
            class="grey lighten-4 tw-mt-4 tw-flex tw-px-3 tw-items-center"
        >
            <VRadioGroup v-if="!disableVisibility" v-model="visibility" row>
                <template #label>
                    <div><strong>Document visibility: </strong></div>
                </template>
                <VRadio label="Public" :value="posterVisibility.PUBLIC" />
                <VRadio label="Private" :value="posterVisibility.PRIVATE" />
            </VRadioGroup>
            <VSpacer />

            <p class="tw-mb-0 tw-mr-4 tw-mt-4 tw-font-bold tw-text-sm tw-opacity-60">
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
        </VCard>

        <VCard v-if="posters.length > 0" class="tw-mt-4">
            <VRow v-if="layout === 1" class="tw-ml-2">
                <VCol v-for="(poster, i) in posters" :key="i" cols="6" md="3">
                    <GalleryDocumentCard :poster="poster" />
                </VCol>
            </VRow>
            <GalleryList v-else-if="layout === 2" :posters="posters" />
        </VCard>
        <NoContentDialog v-else />
    </VContainer>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGripHorizontal, faThList, faUpload } from '@fortawesome/pro-solid-svg-icons'
import { Poster } from '~/types/entities/Poster.entity'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'
import { APIRoutesV2 } from '~/types/typing'

export default Vue.extend({
    name: 'GalleryPosterRelatedPage',
    components: {
        FontAwesomeIcon,
    },
    data() {
        return {
            layout: 2,
            posters: [],
            // visibility: this.$route.query.visibility || PosterVisibilityEnum.PUBLIC,
            visibility: PosterVisibilityEnum.PRIVATE,
            posterVisibility: PosterVisibilityEnum,
            disableVisibility: true,
        }
    },
    async fetch(): Promise<void> {
        try {
            const params = this.createRelatedPostersQueryParams()
            if (this.paramsIncludesTopicsAndKeywords(params)) {
                const posters = await this.$axios.$get(
                    APIRoutesV2.WORKSPACES_ID_POSTERS(this.$accessor.workspace.getWorkspaceId),
                    {
                        params,
                    }
                )

                this.posters = posters.filter((poster) => this.poster.id !== poster.id)
            }
        } catch (e) {
            this.posters = []
        }
    },
    computed: {
        ...mapGetters('tenant', ['getTheme']),
        icons() {
            return {
                faGripHorizontal,
                faThList,
                faUpload,
            }
        },
        poster(): Poster {
            return this.$store.getters['gallery/getPoster']
        },
    },
    created(): void {
        this.setVisibilityQueryParam()
    },
    methods: {
        changeVisibility(visibility) {
            if (visibility in PosterVisibilityEnum) {
                this.$router.push({
                    query: {
                        visibility,
                    },
                })
                this.visibility = visibility
                this.$fetch()
            }
        },
        async setVisibilityQueryParam(): Promise<void> {
            if (!this.$route.query.visibility) {
                this.visibility = PosterVisibilityEnum.PUBLIC
                await this.$router.push({
                    query: {
                        ...this.$route.query,
                        visibility: PosterVisibilityEnum.PUBLIC,
                    },
                })
            }
        },
        createRelatedPostersQueryParams(): Record<string, any> {
            let params: Record<string, any> = {
                visibility: this.visibility,
                or: true,
            }
            params = this.addTopicsNames(params)
            params = this.addKeywordsNames(params)
            return params
        },
        paramsIncludesTopicsAndKeywords(params: Record<string, any>): boolean {
            return 'keywords' in params || 'topics' in params
        },
        addTopicsNames(params: Record<string, any>): Record<string, any> {
            if (this.poster.topics.length > 0) {
                params.topics = this.poster.topics.map((topic) => topic.name)
            }
            return params
        },
        addKeywordsNames(params: Record<string, any>): Record<string, any> {
            if (this.poster.keywords.length > 0) {
                params.keywords = this.poster.keywords.map((keyword) => keyword.name)
            }
            return params
        },
    },
})
</script>

<style></style>
