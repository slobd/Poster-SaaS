import flow from 'lodash/flow'
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil'
import toString from 'lodash/toString'
import { Ref, useContext, useRoute, useRouter, watch } from '@nuxtjs/composition-api'

export type QueryType = 'string' | 'number' | 'boolean'

export default function useUtils() {
    const { $logger } = useContext()
    const route = useRoute()
    const router = useRouter()

    const removeEmptyKeyFromObject = (obj: Record<string, any>): Record<string, any> =>
        flow(
            (o) => omitBy(o, isNil),
            (o) => omitBy(o, (val) => val === '')
        )(obj)

    function getServerUrl() {
        if (process.server) {
            return 'http://locahost:3000'
        } else {
            return window.location.origin
        }
    }

    /**
     * Synchronize a data reference with the route query
     * @param ref Reference to watch and sync with the route query
     * @param queryName Name of the route query
     */
    function syncRefWithQuery(ref: Ref<string | number | boolean>, queryName: string) {
        if (route.value.query[queryName]) {
            const queryValue = route.value.query[queryName]

            const queryType: QueryType = _getQueryType(queryValue)

            if (queryType === 'boolean') ref.value = queryValue === 'true'
            else if (queryType === 'number') ref.value = parseInt(queryValue as string)
            else ref.value = route.value.query[queryName] as string
        }

        // BUG: There is a race condition when a page use multiple syncRefWithQuery
        // Only one query gets updated on page load
        watch(
            [ref],
            async ([newValue]) => {
                await router.push({
                    query: {
                        [queryName]: toString(newValue),
                    },
                })
            },
            {
                immediate: true,
            }
        )
    }

    /**
     * @throws Error throws error for unvalid types
     * @param queryValue
     */
    function _getQueryType(queryValue: string | (string | null)[]): QueryType {
        if (Array.isArray(queryValue)) throw new Error('Array values are not supported')
        else if (Number.isInteger(parseInt(queryValue))) return 'number'
        else if (queryValue === 'true' || queryValue === 'false') return 'boolean'
        else return 'string'
    }

    /**
     * @param elementId ID of the parent component of the Vue-PDF component
     * @param name  A USVString representing the file name or the path to the file.
     */
    async function getImageFileFromCanvas(elementId: string, name: string): Promise<File> {
        const blob: BlobPart = await getBlobFromCanvas(elementId)
        const file = new File([blob], name)
        $logger.debug(file, 'getImageFromCanvas.file')
        return file
    }

    /**
     * @param elementId ID of the parent component of the Vue-PDF component pdf-upload
     */
    function getBlobFromCanvas(elementId: string): Promise<BlobPart> {
        return new Promise((resolve, reject) => {
            const vuePdfParent = document.getElementById(elementId)
            if (vuePdfParent) {
                // Wait for Vue-PDF to create the content of the canvas
                setTimeout(() => {
                    const canvas = vuePdfParent.getElementsByTagName('canvas')[0]
                    $logger.debug(canvas, 'getBlobFromCanvas.canvas')

                    if (canvas) {
                        const blob = dataURItoBlob(canvas.toDataURL('image/jpeg', 1))
                        $logger.debug(blob, 'getBlobFromCanvas.blob')
                        resolve(blob)
                    } else {
                        reject(new Error('Canvas is not defined'))
                    }
                }, 2000)
            } else {
                $logger.error('No object with id pdf-upload')
                reject(new Error('No object with id pdf-upload'))
            }
        })
    }

    const dataURItoBlob = (dataURI: string) => {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        const byteString = atob(dataURI.split(',')[1])

        // separate out the mime component
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
        }

        return new Blob([ab], { type: mimeString })
    }

    return {
        removeEmptyKeyFromObject,
        getServerUrl,
        syncRefWithQuery,
        getImageFileFromCanvas,
    }
}
