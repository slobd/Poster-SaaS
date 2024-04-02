import { Plugin } from '@nuxt/types'

const cookiesPlugin: Plugin = ({ store }) => {
    const bootstrap = store.state.cookies.bootstrap

    if (bootstrap) {
        store.dispatch('cookies/enableAnalytics')
    }
}

export default cookiesPlugin
