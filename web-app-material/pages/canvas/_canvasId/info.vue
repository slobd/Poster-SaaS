<template>
    <div class="tw-w-full">
        <CanvasIdHeader> Canvas info</CanvasIdHeader>
        <div class="tw-flex tw-flex-col tw-justify-between lg:tw-flex-row">
            <!-- Buttons -->
            <div class="tw-w-full tw-space-y-3 lg:tw-w-3/12 xl:tw-w-4/12 tw-mt-2">
                <div v-for="(menuItem, i) in menu" :key="menuItem">
                    <VBtn
                        v-if="handleMorrisonCase(menuItem)"
                        :disabled="uploading"
                        :color="indexTracker === i ? 'primary' : 'default'"
                        block
                        :outlined="indexTracker !== i"
                        @click.prevent="setIndex(i)"
                    >
                        <span class="tw-flex tw-text-left">
                            {{ menuItem }}
                        </span>
                    </VBtn>
                </div>
            </div>

            <!-- Content block -->
            <div class="tw-w-full lg:tw-w-9/12 xl:tw-w-8/12 lg:tw-pl-8">
                <div>
                    <!-- 0 = title -->
                    <VTextarea
                        v-if="indexTracker === 0"
                        :key="indexTracker"
                        placeholder="A good title matters. You could use the following formula: [Result]: A [method] study of [topic] among [sample]"
                        dense
                        outlined
                        :rows="9"
                        name="title"
                        :value="getTitle"
                        :maxlength="110"
                        @input="updateTitle({ value: $event })"
                    />

                    <!-- 1 = finding -->
                    <div v-if="indexTracker === 1 && getLayout.includes('morrison')">
                        <VTextarea
                            :key="indexTracker"
                            :placeholder="getFindingBlock.placeholder"
                            dense
                            outlined
                            :rows="9"
                            name="finding"
                            :value="getFindingBlock.simpleText"
                            :maxlength="100"
                            @input="updateFinding({ value: $event })"
                        />
                        <VCard class="tw-mt-4 tw-bg-gray-300">
                            <CanvasUpload
                                :disabled="getFindingBlock.image.location.length > 0"
                                description="Only png and jpg are allowed. (max. 1 file, max. size 3mb)"
                                :max-files="1"
                                @input="handleImageInput"
                                @loading="uploading = $event"
                            />
                        </VCard>
                        <!-- Start delete image block -->
                        <div class="tw-flex tw-flex-row tw-pt-4 tw-align-end">
                            <div class="tw-flex tw-items-center tw-mb-4 tw-text-primary">
                                <VBtn
                                    v-if="getFindingBlock.image.location"
                                    fab
                                    small
                                    text
                                    class="hover:tw-text-primary tw-mr-2"
                                    @click="removeFindingImage"
                                >
                                    <FontAwesomeIcon :icon="icons.faTimesCircle"></FontAwesomeIcon>
                                </VBtn>
                                {{ getFindingBlock.image.originalname }}
                            </div>
                        </div>
                    </div>

                    <!-- 2 = description -->
                    <VTextarea
                        v-if="indexTracker === 2"
                        :key="indexTracker"
                        placeholder="Provide a description of your canvas."
                        dense
                        outlined
                        :rows="9"
                        name="description"
                        :value="getDescription"
                        :maxlength="300"
                        @input="updateDescription"
                    />

                    <!-- 3 = topics -->
                    <VCombobox
                        v-if="allowAnyTopic"
                        name="topics"
                        placeholder="Topics"
                        small-chips
                        multiple
                        clearable
                        outlined
                        :value="getTopics"
                        @input="updateTopic($event)"
                    />

                    <!-- 4 = keywords -->
                    <VCombobox
                        v-if="indexTracker === 4"
                        placeholder="Keywords"
                        name="keywords"
                        small-chips
                        multiple
                        clearable
                        outlined
                        :value="getKeywords"
                        @input="updateKeyword($event)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { defineComponent } from '@nuxtjs/composition-api'
import { faTimesCircle } from '@fortawesome/pro-regular-svg-icons'
import { PDFType } from '~/types/canvas'
import useIcons from '@/composables/common/useIcons'

export default defineComponent({
    setup() {
        const { icons } = useIcons({
            faTimesCircle,
        })

        return {
            icons,
        }
    },
    data() {
        return {
            menu: ['Title', 'Finding', 'Description', 'Topics', 'Keywords'], // Order matters
            indexTracker: 0,
            uploading: false,
        }
    },
    computed: {
        ...mapGetters('canvas', [
            'getTitle',
            'getFindingBlock',
            'getDescription',
            'getTopics',
            'getKeywords',
            'getLayout',
        ]),
        ...mapGetters('tenant', ['getTheme']),
        allowAnyTopic() {
            return (
                this.indexTracker === 3 &&
                (this.getTheme.posterlab ||
                    (!this.getTheme.posterlab &&
                        this.getTheme.appContent.autocompleteTopics.length === 0))
            )
        },
        allowGivenTopics() {
            return (
                this.indexTracker === 3 &&
                !this.getTheme.posterlab &&
                this.getTheme.appContent.autocompleteTopics.length > 0
            )
        },
    },
    mounted() {
        // Have Finding at a single place
        this.menu[1] = this.getFindingBlock.name
    },
    methods: {
        ...mapMutations('canvas', [
            'updateTitle',
            'updateFinding',
            'updateDescription',
            'updateKeyword',
            'updateKeywordNLP',
            'updateTopic',
            'updateTopicNLP',
            'addFindingImage',
            'removeFindingImage',
        ]),
        setIndex(index) {
            this.indexTracker = index
        },
        handleMorrisonCase(name) {
            if (name === this.getFindingBlock?.name) {
                if (this.getLayout.includes(PDFType.MORRISON)) {
                    return true
                }
                return false
            }
            return true
        },
        handleImageInput(files) {
            files.forEach((file) => {
                this.addFindingImage(file)
            })
        },
    },
})
</script>
