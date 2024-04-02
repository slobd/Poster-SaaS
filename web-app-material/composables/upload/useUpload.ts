import { computed, reactive, ref, useContext, useRoute } from '@nuxtjs/composition-api'
import { AxiosError } from 'axios'
import { uniq } from 'lodash'
import { APIRoutesV2 } from '~/types/typing'
import usePoster from '~/composables/gallery/usePoster'
import useUtils from '~/composables/common/useUtils'
import { PosterTypeEnum } from '~/types/entities/PosterType.entity'
import { UploadResponse } from '~/types/entities/Upload.entity'
import { Group } from '~/types/entities/Group.entity'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'

interface Author {
    id?: number
    firstName: string
    lastName: string
    email: string
    organizationName: string
}

export default function useUpload() {
    const { $axios, $accessor, $auth, $logger } = useContext()
    const $route = useRoute()
    const { generatePosterAssetName } = usePoster()
    const { getImageFileFromCanvas } = useUtils()

    const defaultPoster = {
        id: null,
        title: '',
        user: $auth.user,
        description: '',
        visibility: PosterVisibilityEnum.PUBLIC,
        type: { name: PosterTypeEnum.UPLOADED },
        authors: [
            {
                id: $auth.user.id,
                firstName: $auth.user.firstName,
                lastName: $auth.user.lastName,
                email: $auth.user.email,
                organizationName: $auth.user.organizationName,
            },
        ] as Author[],
        topics: [] as object[],
        keywords: [] as object[],
        pdf: null as UploadResponse | null,
        image: null as UploadResponse | null,
        group: null as Partial<Group> | null,
        workspace: {
            id: null as number | null,
            tenantId: null as number | null,
        },
    }

    type Poster = typeof defaultPoster

    const poster = ref<Poster>(defaultPoster)

    const assets = reactive({
        pdf: null as File | null,
        image: null as File | null,
        // Image generated from the PDF file
        generatedImage: null as File | null,
    })
    const isGeneratingImage = ref(false)

    const uploadState = reactive({
        succesful: false,
        pending: false,
        error: null as Error | null,
    })

    const _pdfDataURL = ref<string | ArrayBuffer>('')

    const pdfPreviewURL = computed(() => _pdfDataURL.value)

    const thumbnail = computed(() => {
        // Image and generatedImage has size > 0 when the user has changed it (on creation or update)
        // Therefore it takes presence over the image key of the poster
        if (assets.image && assets.image.size > 0) return URL.createObjectURL(assets.image)

        if (assets.generatedImage && assets.generatedImage.size > 0)
            return URL.createObjectURL(assets.generatedImage)

        if (poster.value.image?.location) return poster.value.image?.location

        return ''
    })

    const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)
    const tenantId = computed(() => $accessor.tenant.getTenantId)

    async function fetchPoster() {
        try {
            const posterId = $route.value.params.uploadId
            const res = await $axios.$get(
                APIRoutesV2.WORKSPACES_ID_POSTERS_ID(workspaceId.value, posterId)
            )

            // Create file object from url
            if (res.pdf) {
                const response = await fetch(res.pdf.location)
                const data = await response.blob()
                assets.pdf = new File([data], res.pdf.originalname, {
                    type: res.pdf.contentType,
                })
            }

            if (res.image) {
                assets.image = new File([], res.image.originalname, {
                    type: res.image.contentType,
                })
            }

            poster.value = {
                id: res.id,
                title: res.title,
                description: res.description,
                topics: res.topics.map((t) => ({ text: t.name })),
                keywords: res.keywords.map((k) => ({ text: k.name })),
                authors: res.authors,
                visibility: res.visibility,
                type: res.type,
                pdf: res.pdf,
                image: res.image,
                user: res.user,
                group: res.group,
                workspace: {
                    id: workspaceId.value,
                    tenantId: tenantId.value,
                },
            }
            $logger.debug(poster.value)
        } catch (error) {
            if (error.isAxiosError) {
                const axiosError = error as AxiosError
                $logger.error({
                    config: axiosError.config,
                    data: axiosError.response?.data,
                })
            }
        }
    }

    async function handlePdfInput(file: File) {
        assets.pdf = file

        // Only generate image file when the user has not submited his own image
        if (assets.image && assets.image.size > 0) return

        if (file) {
            await _generateImage(file)
        } else {
            _removeGeneratedImage()
        }
    }

    async function handleImageInput(file: File) {
        assets.image = file
        /**
         * When removing the cover image if there is a PDF we generate a new cover image from it
         */
        if (!file && assets.pdf) {
            _removeGeneratedImage()
            await _generateImage(assets.pdf)
        }
    }

    async function _generateImage(file: File) {
        isGeneratingImage.value = true
        // URL to render the pdf in Vue-PDF component from which we generate an image file
        _pdfDataURL.value = await _generatePdfDataUrl(file)
        assets.generatedImage = await getImageFileFromCanvas(
            'pdf-upload',
            `${generatePosterAssetName(poster.value.title)}.jpg`
        )
        isGeneratingImage.value = false
    }

    function _removeGeneratedImage() {
        _pdfDataURL.value = ''
        assets.generatedImage = null
    }

    // Generates a Data URL from the uploaded file that the Vue-PDF component can read
    function _generatePdfDataUrl(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function () {
                if (reader.result) {
                    resolve(reader.result)
                } else {
                    resolve('')
                }
            }
            reader.onerror = function () {
                reject(reader.error)
            }
        })
    }

    async function savePoster(): Promise<void> {
        uploadState.pending = true

        const formData = _createPosterFormData()

        try {
            let res
            if (poster.value.id) {
                res = await $axios.patch(
                    APIRoutesV2.WORKSPACES_ID_POSTERS_ID(workspaceId.value, poster.value.id),
                    formData
                )
            } else {
                // res = await $axios.post(APIRoutes.POSTERS, formData)
                res = await $axios.post(
                    APIRoutesV2.WORKSPACES_ID_POSTERS(workspaceId.value),
                    formData
                )
            }

            $logger.debug(res, 'savePoster.res')
            poster.value.id = res.data.id
            uploadState.succesful = true
        } catch (error) {
            $logger.error(error)
            $accessor.banner.setBanner({
                value: true,
                type: 'error',
                message: 'There was an error while saving your Poster',
            })
        } finally {
            uploadState.pending = false
        }
    }

    function _createPosterFormData() {
        console.log('_createPosterFormData', typeof workspaceId.value)
        poster.value.workspace = {
            id: workspaceId.value,
            tenantId: tenantId.value,
        }
        $logger.debug(poster.value, 'savePoster')
        const formData = new FormData()
        formData.append('data', _getPosterData(poster.value))

        if (assets.pdf && assets.pdf.size > 0) formData.append('pdf', assets.pdf, assets.pdf.name)

        if (assets.image && assets.image.size > 0)
            formData.append('image', assets.image, assets.image.name)
        else if (assets.generatedImage && assets.generatedImage.size > 0)
            // Sends the image generated from the pdf if there is no custom cover image
            formData.append('image', assets.generatedImage, assets.generatedImage.name)

        $logger.debug(assets, 'savePoster.assets')

        return formData
    }

    function _getPosterData(poster) {
        const obj = {
            ...poster,
            keywords: poster.keywords.map((k) => ({ name: k.text })),
            topics: poster.topics.map((k) => ({ name: k.text })),
        }
        $logger.debug(obj, '_getPosterData')

        return JSON.stringify(obj)
    }

    function hasErrorInStep(errors: Record<string, string[]>, fields: string[]) {
        for (const field of fields) {
            if (errors[field]?.length > 0) return false
        }
        return true
    }

    function removeDuplicates(input: string[]) {
        return uniq(input)
    }

    const axiosInstance = computed(() => {
        return $axios.create({ baseURL: 'https://nlp.posterlab.co/' })
    })

    async function fetchNLPData(file: File, title: string) {
        try {
            const formData = new FormData()
            formData.append('file', file, title)
            const response = await axiosInstance.value.post('/api/readPdf', formData)
            if (response.data.statusCode && response.data.statusCode === 500)
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'error',
                    message: response.data.message,
                })
            if (response.data.topics) {
                let topics = response.data.topics.map((name) => ({ text: name[0] }))
                topics = removeDuplicates(topics)
                poster.value.topics = topics
            }
            if (response.data.keywords) {
                poster.value.keywords = removeDuplicates(response.data.keywords).map((name) => ({
                    text: name,
                }))
            }
            if (response.data.summary) {
                poster.value.description = response.data.summary
            }
            return true
        } catch (error) {
            $accessor.banner.setBannerWithTimeout({
                value: true,
                type: 'error',
                message: 'NLP server connection failed',
            })
            return false
        }
    }

    function resetPoster() {
        $logger.error('resetting poster')
        poster.value = defaultPoster
    }

    return {
        // Refs
        poster,
        assets,
        uploadState,
        isGeneratingImage,
        // Computed
        pdfPreviewURL,
        thumbnail,
        // Methods
        fetchPoster,
        handlePdfInput,
        handleImageInput,
        savePoster,
        hasErrorInStep,
        removeDuplicates,
        fetchNLPData,
        resetPoster,
    }
}
