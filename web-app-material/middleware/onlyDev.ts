import { Context } from '@nuxt/types'

export default function ({ redirect }: Context) {
    if (process.env.NODE_ENV === 'production') {
        redirect(process.env.productionRedirectPath as string)
    }
}
