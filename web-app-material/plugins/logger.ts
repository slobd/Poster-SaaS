import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import pino from 'pino'

export default defineNuxtPlugin((_ctx, inject) => {
    const logger = pino({
        browser: {
            // serialize: true,
        },
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    })
    inject('logger', logger)
})
