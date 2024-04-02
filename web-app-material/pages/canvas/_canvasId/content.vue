<template>
    <div class="tw-w-full">
        <CanvasIdHeader> Insert the <strong>content</strong> of your research</CanvasIdHeader>
        <div class="tw-flex tw-flex-col tw-justify-between lg:tw-flex-row">
            <div class="tw-w-full tw-space-y-3 lg:tw-w-3/12 tw-xl:w-4/12">
                <!-- Select block buttons -->
                <div v-for="({ name }, index) in blocks" :key="`name${index}`">
                    <CanvasContentButton
                        :focus="index === indexTracker"
                        :disabled="disableBlockNavigation"
                        :name="name"
                        :index="index"
                        @set-index="setIndex(index)"
                    />
                </div>

                <VBtn
                    v-if="!disableAddMoreBlock"
                    color="primary"
                    small
                    text
                    @click.prevent="addBlock({ name: '' })"
                >
                    <FontAwesomeIcon :icon="icons.faPlus" fixed-width size="sm" />
                    {{ addBlockText }}
                </VBtn>
            </div>

            <!-- Start Content block -->
            <div class="tw-w-full lg:tw-w-9/12 tw-xl:w-8/12 lg:tw-pl-8">
                <div v-if="currentBlock">
                    <!-- Block content -->
                    <VeeTextarea
                        :key="indexTracker"
                        :rules="`max:${maxInputLength}`"
                        :placeholder="currentBlock.placeholder"
                        dense
                        outlined
                        :rows="9"
                        :name="currentBlock.name"
                        :value="currentBlock.simpleText"
                        :counter="450"
                        @input="
                            updateBlockValue({
                                value: $event,
                                index: indexTracker,
                            })
                        "
                    />

                    <!-- Start Image Upload block -->
                    <VCard v-if="!layout.includes(pdfType.SIMPLE)" class="tw-mt-4 tw-bg-gray-300">
                        <CanvasUpload
                            :disabled="disableUpload"
                            :description="uploadDescription"
                            :multiple="layout.includes(pdfType.CLASSIC)"
                            :max-files="layout.includes(pdfType.MORRISON) ? 1 : 2"
                            @input="handleImageInput"
                            @loading="disableBlockNavigation = $event"
                        />
                    </VCard>

                    <!-- Start delete image block -->
                    <div
                        v-if="!layout.includes(pdfType.SIMPLE)"
                        class="tw-flex tw-flex-row tw-pt-4 tw-align-end"
                    >
                        <div
                            v-for="(image, index) in currentBlock.images"
                            :key="index"
                            class="tw-flex tw-flex-row tw-mb-4 tw-text-primary"
                        >
                            <VBtn
                                fab
                                small
                                text
                                class="hover:tw-text-primary tw-mr-2"
                                @click="removeImageFromBlock(image, index)"
                            >
                                <FontAwesomeIcon
                                    size="lg"
                                    :icon="icons.faTimesCircle"
                                ></FontAwesomeIcon>
                            </VBtn>
                            <p class="tw-flex tw-items-center tw-cursor-text tw-m-0">
                                {{ image.originalname }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { faTimesCircle } from '@fortawesome/pro-regular-svg-icons'
import { defineComponent } from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'
import { Block, MaxContentLength, PDFLayout, PDFType } from '~/types/canvas'
import { UploadResponse } from '~/types/entities/Upload.entity'
import { APIRoutes } from '~/types/typing'

export default defineComponent({
    setup() {
        const { icons } = useIcons({
            faPlus,
            faTimesCircle,
        })

        return {
            icons,
        }
    },
    data() {
        return {
            indexTracker: 0,
            pdfType: PDFType,
            pdfLayout: PDFLayout,
            disableBlockNavigation: false,
        }
    },
    computed: {
        ...mapGetters('canvas', {
            blocks: 'getBlocks',
            layout: 'getLayout',
        }),
        disableAddMoreBlock(): boolean {
            if (this.blocks.length > 5) return true
            if (this.layout.includes(this.pdfType.MORRISON) && this.blocks.length > 3) return true
            return this.layout.includes(this.pdfType.CLASSIC) && this.blocks.length > 5
        },
        disableUpload(): boolean {
            if (this.layout.includes(this.pdfType.CLASSIC)) {
                return this.currentBlock?.images.length > 1
            }
            if (this.layout.includes(this.pdfType.MORRISON)) {
                this.blocks.forEach(({ images }: Block, index: number) => {
                    // Clear images, when more than one
                    while (images.length > 1) {
                        this.removeBlockImage({
                            index: this.indexTracker,
                            position: index,
                        })
                    }
                })
                return this.currentBlock?.images.length > 0
            }
            return false
        },
        uploadDescription(): string {
            if (this.layout.includes(this.pdfType.MORRISON)) {
                return 'Only png and jpg are allowed. (max. 1 file, max. size 3mb)'
            } else {
                return 'Only png and jpg files are allowed. (max. 2 files, max. size 3mb)'
            }
        },
        maxInputLength(): number {
            if (this.layout.includes(this.pdfType.MORRISON)) {
                if (this.layout === this.pdfLayout.MORRISON_LANDSCAPE) {
                    return MaxContentLength.MORRISON_LANDSCAPE_CONTENT_LENGTH
                }

                return MaxContentLength.MORRISON_PORTRAIT_CONTENT_LENGTH
            } else {
                return MaxContentLength.CLASSIC_LANDSCAPE_CONTENT_LENGTH
            }
        },
        addBlockText(): string {
            if (
                this.layout.includes(this.pdfType.CLASSIC) ||
                this.layout.includes(this.pdfType.MORRISON)
            ) {
                return 'Add more blocks (max. 6)'
            } else {
                return ''
            }
        },
        currentBlock(): any {
            return this.blocks[this.indexTracker]
        },
    },
    mounted(): void {
        this.setAskOnReload()
    },
    methods: {
        ...mapMutations('canvas', {
            setAskOnReload: 'setAskOnReload',
            addBlock: 'addBlock',
            updateBlockValue: 'updateBlockValue',
            addBlockImage: 'addBlockImage',
            removeBlockImage: 'removeBlockImage',
        }),
        setIndex(index: number): void {
            this.indexTracker = index
        },
        handleImageInput(files: UploadResponse[]): void {
            files.forEach((file) => {
                this.addBlockImage({
                    index: this.indexTracker,
                    imageData: file,
                })
            })
        },
        async removeImageFromBlock(image: UploadResponse, position: number): Promise<void> {
            this.removeBlockImage({
                index: this.indexTracker,
                position,
            })

            await this.$axios.$delete(`${APIRoutes.UPLOADS}/${image.id}`)
        },
    },
})
</script>
