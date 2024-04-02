<template>
    <div class="tw-flex tw-flex-col tw-items-center">
        <label
            v-if="label"
            :for="name"
            class="
                tw-px-2
                tw-py-3
                tw-text-base
                tw-rounded-md
                tw-cursor-pointer
                tw-text-pl-gray-6
                tw-underline
            "
            :class="classes"
        >
            <slot>
                <FontAwesomeIcon
                    v-if="icon.length > 0 && iconPosition === 'left'"
                    :icon="iconComputed"
                    :class="iconClassComputed"
                    :size="iconSize"
                    fixed-width
                />
                {{ label }}
                <FontAwesomeIcon
                    v-if="icon.length > 0 && iconPosition === 'right'"
                    :icon="iconComputed"
                    :class="iconClassComputed"
                    fixed-width
                />
            </slot>
        </label>

        <input
            :id="name"
            type="file"
            :name="name"
            :accept="accept"
            :disabled="disabled"
            :multiple="multiple"
            :value="value"
            class="tw-hidden"
            @input="handleInputChange"
        />
        <div class="tw-text-sm tw-text-gray-500" :class="description ? 'tw-mb-4' : ''">
            {{ description }}
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import { faFileUpload, faSpinnerThird } from '@fortawesome/pro-solid-svg-icons'
import { EventEmitterEnum } from '~/types/canvas'
import { UploadResponse } from '~/types/entities/Upload.entity'
enum IconPosition {
    left = 'left',
    right = 'right',
}

export default Vue.extend({
    name: 'CanvasUpload',
    props: {
        name: {
            type: String,
            default: 'upload',
        },
        label: {
            type: String,
            default: 'Upload media',
        },
        description: {
            type: String,
            default: 'Browse your files here',
        },
        icon: {
            type: Object,
            default: () => faFileUpload,
        },
        iconSize: {
            type: String,
            default: 'lg',
        },
        iconPosition: {
            type: String,
            default: IconPosition.left,
            validator(val) {
                return val in IconPosition
            },
        },
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers
        accept: {
            type: String,
            default: 'image/*',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        maxFiles: {
            type: Number,
            default: 1,
        },
        bgColog: {
            type: String,
            default: 'tw-bg-gray-100',
        },
        inlineLabelAndIcon: {
            type: Boolean,
            default: false,
        },
        // Will return the raw files only
        rawFileOnly: {
            type: Boolean,
            default: false,
        },
        // In bytes. Default to 3MB
        maxFileSize: {
            type: Number,
            default: 3145728,
        },
        // Should upload take place or not
        shouldUpload: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            uploadFilename: this.label,
            value: '',
            loading: false,
        }
    },
    computed: {
        classes(): Record<string, boolean> {
            return {
                'tw-cursor-not-allowed tw-opacity-50': this.disabled || this.loading,
                'tw-sr-only': !this.label,
                bgColor: true,
                'tw-flex tw-flex-row': this.inlineLabelAndIcon,
            }
        },
        iconComputed(): any[] {
            return this.loading ? faSpinnerThird : this.icon
        },
        iconClassComputed(): string {
            return this.loading ? 'tw-mr-2 fa-spin fa-xl' : 'tw-mr-2 tw-text-gray-600'
        },
    },
    methods: {
        ...mapActions('canvas', {
            uploadFile: 'uploadFile',
        }),
        async handleInputChange(event: any) {
            const response: UploadResponse[] = []
            const files: File[] = [...event.target.files]
            const rawFiles: File[] = Array.from(files).map(
                (file: File) => new File([file], file.name)
            )

            if (!files) return
            if (files.length > this.maxFiles)
                // TODO define a custom/general alert component
                return alert(`You can upload only ${this.maxFiles} files`)

            let fileSizeLimit = false
            if (!this.loading) {
                this.loading = true
                this.$emit('loading', this.loading)
                // Also emit a nuxt event to prevent route changes
                this.$nuxt.$emit(EventEmitterEnum.FILE_UPLOAD_EVENT, {
                    loading: this.loading,
                })
            }
            await Promise.all(
                Array.from(files).map(async (file) => {
                    const { size, name } = file
                    if (size > this.maxFileSize) {
                        fileSizeLimit = true
                        return alert(
                            `File ${name} is bigger than expected. File size is limited to ${
                                this.maxFileSize / 1048576
                            }mb`
                        )
                    }

                    // If we only need the raw file
                    if (this.rawFileOnly) return file

                    const responseFile: UploadResponse | undefined = this.shouldUpload
                        ? await this.uploadFile(file)
                        : null
                    if (responseFile) response.push(responseFile)
                })
            )
            this.loading = false
            this.$emit('loading', this.loading)

            // If file size has exceeded, return empty
            if (fileSizeLimit) return this.$emit('input', [])

            // If we only need the raw file(s)
            if (this.rawFileOnly) return this.$emit('rawFiles', rawFiles)

            this.$emit('input', response)
            // Update event to unlock the route
            this.$nuxt.$emit(EventEmitterEnum.FILE_UPLOAD_EVENT, {
                loading: this.loading,
            })
        },
    },
})
</script>
