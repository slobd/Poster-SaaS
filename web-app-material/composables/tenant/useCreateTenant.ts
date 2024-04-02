import { useContext } from '@nuxtjs/composition-api'
import { FloatingBannerEnum } from '~/types/banner'
import { APIRoutes } from '~/types/typing'

export default function useCreateTenant() {
    const { $axios, $accessor } = useContext()

    const handlePostTenant = async (input) => {
        try {
            return await $axios.$post('/tenants', input)
        } catch (error) {
            const errorMessage =
                error.response.data.error[Object.keys(error.response.data.error)[0]][0]
            if (errorMessage)
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.error,
                    message: errorMessage,
                })
            else
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.error,
                    message: 'Event creation failed. Please contact support for further details.',
                })
        }
    }

    const checkUniqueParam = async (type: string, value: string) => {
        const params = {
            [type]: value,
        }
        const tenant = await $axios.$get('/tenants', { params })
        if (tenant) return tenant
        else return null
    }

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        try {
            return await $axios.post(APIRoutes.UPLOADS, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        } catch (error) {
            $accessor.banner.setBanner({
                value: true,
                message: 'There was an error while uploading the logo',
                type: 'error',
            })
        }
    }

    return {
        handlePostTenant,
        checkUniqueParam,
        uploadFile,
    }
}
