/* eslint-disable no-console */
/* eslint-disable camelcase */
import { Context } from '@nuxt/types'
import { AxiosError } from 'axios'
import qs from 'qs'
import { HttpStatus } from '~/types/typing'

export default function ({ $axios, $accessor, store }: Context) {
    $axios.interceptors.request.use((config) => {
        if (store.state.tenant.tenantId) {
            config.headers['x-tenant'] = store.state.tenant.tenantId
        }
        config.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'brackets' })
        return config
    })

    $axios.onError((error: AxiosError) => {
        // Allows Bad Request 400 (validation) error to be caught in the frontend
        // to be able to provide feedback to the user (e.g. missing required field of a form)
        if (error?.response?.status === HttpStatus.BAD_REQUEST) return

        console.group('Axios error')
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('Error Response Data: ', error.response.data)
            console.log('Error Response Status: ', error.response.status)
            console.log('Error Response Headers: ', error.response.headers)

            if (error?.response?.status === HttpStatus.FORBIDDEN) return Promise.resolve(false)

            $accessor.banner.setError(error.response.data.message)
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log('Error Request: ', error.request)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error Message: ', error.message)
        }
        console.log('Error Config: ', {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
            baseURL: error.config.baseURL,
        })
        console.groupEnd()

        return Promise.resolve(false)
    })
}
