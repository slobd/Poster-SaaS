import colors from 'vuetify/es5/util/colors'
import { APIRoutes } from './types/typing'

export default {
    env: {
        nodeEnv: process.env.NODE_ENV,
        productionRedirectPath: '/home',
        devMode: process.env.NODE_ENV === 'development',
        jitsiAppId: process.env.VUE_APP_JITSI_APP_ID,
        helpAndSupport: 'https://doc.clickup.com/18308652/p/h/heqhc-5782/7b7c1e83b7bb12d',
        termsOfUse: 'https://doc.clickup.com/18308652/p/h/heqhc-2321/4e540319baac667',
        privacyPolicy: 'https://doc.clickup.com/18308652/p/h/heqhc-1481/7d631935af4aa3f',
        contactSupport: 'https://forms.clickup.com/18308652/f/heqhc-12161/NAMQQKPDYPSONKGA6O',
        webAppAzureUrlPart1: process.env.WEB_APP_AZURE_URL_PART1,
        webAppAzureUrlPart2: process.env.WEB_APP_AZURE_URL_PART2,
        passwordResetUrl: process.env.PASSWORD_RESET_URL,
        CLIENT_URL: process.env.CLIENT_URL,
        webAppAzureSignUpUrl: process.env.WEB_APP_AZURE_SIGN_UP_URL,
    },
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        titleTemplate: '%s',
        title: 'PosterLab',
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' },
            {
                name: 'keywords',
                content:
                    'knowledge transfer, scientific communication, online poster session, online research, research findings, research status, grants matching, grants applications, find research, scientific canvas, life science, chemistry, physics, research organization, university, research centers, research clusters, R&D, dissemination, suite, workflows, standards, distribution, collaboration, scholarly communication, outreach, online scientific conference',
            },
        ],
        link: [
            {
                rel: 'short icon',
                type: 'image/png',
                href: 'https://posterlab-production.s3.eu-central-1.amazonaws.com/favicon.png',
            },
        ],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['@fortawesome/fontawesome-svg-core/styles.css', '@/assets/css/layout/_layout.css'],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        '~/plugins/font-awesome.ts',
        '~/plugins/vee-validate.ts',
        { src: '~/plugins/vue-pdf.ts', ssr: false },
        '~/plugins/axios.ts',
        { src: '~/plugins/cypress', mode: 'client' },
        '~/plugins/cookies.client.ts',
        '~/plugins/logger.ts',
        '~/plugins/casl.ts',
        '~/plugins/api.ts',
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: [{ path: '~/components', extensions: ['vue'], pathPrefix: false }],

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build',
        // https://go.nuxtjs.dev/vuetify
        '@nuxtjs/tailwindcss',
        // https://vuetifyjs.com/en
        '@nuxtjs/vuetify',
        // https://typed-vuex.roe.dev
        'nuxt-typed-vuex',
        // https://composition-api.nuxtjs.org
        '@nuxtjs/composition-api/module',
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        // https://auth.nuxtjs.org/
        '@nuxtjs/auth-next',
        // '@nuxtjs/pwa',
        'cookie-universal-nuxt',
        // https://sentry.nuxtjs.org/guide/setup/
        '@nuxtjs/sentry',
        // https://github.com/dansmaculotte/nuxt-segment
        [
            '@dansmaculotte/nuxt-segment',
            {
                writeKey: process.env.SEGMENT_KEY,
                disabled: true,
                useRouter: true,
            },
        ],
    ],

    /*
     ** Axios module configuration
     ** See https://axios.nuxtjs.org/options
     */
    axios: {
        // Used as fallback if no runtime config is provided
        browserBaseURL: process.env.AXIOS_BROWSER_BASE_URL || process.env.BACKEND_URL,
        baseURL: process.env.AXIOS_BASE_URL || process.env.BACKEND_URL,
        proxy: false,
        // debug: process.env.NODE_ENV === 'development',
    },

    publicRuntimeConfig: {
        axios: {
            browserBaseURL: process.env.AXIOS_BROWSER_BASE_URL || process.env.BACKEND_URL,
            baseURL: process.env.AXIOS_BASE_URL || process.env.BACKEND_URL,
        },
    },

    // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
    vuetify: {
        customVariables: ['~/assets/variables.scss'],
        treeShake: true,
        theme: {
            dark: false,
            themes: {
                light: {
                    primary: '#1C2268',
                },
                dark: {
                    primary: '#1C2268',
                    accent: colors.grey.darken3,
                    secondary: colors.amber.darken3,
                    info: colors.teal.lighten1,
                    warning: colors.amber.base,
                    error: colors.deepOrange.accent4,
                    success: colors.green.accent3,
                },
            },
        },
        icons: {
            iconfont: 'faSvg',
        },
    },
    pwa: {
        meta: {
            name: 'PosterLab | Knowledge transferred. Fast',
            description:
                'Faster knowledge transfer of early research findings in between research stakeholders.',
            author: 'PosterLab.co | hello@posterlab.co',
            ogHost: 'https://app.posterlab.co',
            twitterCard: 'summary',
            twitterSite: '@poster_lab',
        },
    },
    sentry: {
        dsn: process.env.SENTRY_DNS, // Enter your project's DSN here
        debug: process.env.nodeEnv === 'development',
        tracing: true,
    },
    router: {
        linkActiveClass: '',
        linkExactActiveClass: '',
        middleware: ['cookies', 'permissions', 'auth'],
    },
    auth: {
        redirect: {
            login: '/auth/login',
            home: '/home',
            logout: '/auth/login',
        },
        strategies: {
            local: {
                endpoints: {
                    login: {
                        url: '/auth/login',
                        method: 'post',
                    },
                    logout: false,
                    // user: false,
                    user: {
                        url: '/auth/profile',
                        method: 'get',
                    },
                },
                token: {
                    property: 'access_token',
                    required: true,
                    type: 'Bearer',
                },
                user: {
                    property: false,
                    autoFetch: true,
                },
            },
        },
        cookie: {
            /* Expires after 7 days */
            maxAge: 604800,
        },
    },
    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: ['vee-validate/dist/rules'],
    },

    // Everything ssr
    render: {
        bundleRenderer: {
            directives: {
                async can(node, binding) {
                    const { resource, action, resourceId } = binding.value

                    if (!resource || !action) return

                    const style = node.data.style || (node.data.style = {})

                    const setStyle = (value) => {
                        if (Array.isArray(style)) {
                            style.push({ display: value })
                        } else {
                            style.display = value
                        }
                    }

                    setStyle('none')

                    // Handle resources with ID
                    if (resourceId) {
                        const can =
                            (await node.context?.$axios.$post(APIRoutes.IAM_CAN_USER, {
                                resource,
                                resourceId,
                                action,
                            })) ?? false

                        if (can) {
                            setStyle('')
                            return
                        }
                    } else {
                        // Handle resources without ID
                        let userPermissions = node.context?.$accessor.iam.getUserPermissions

                        if (!userPermissions) {
                            await node.context?.$accessor.iam.fetchUserPermissions({ auto: false })
                            userPermissions = node.context?.$accessor.iam.getUserPermissions
                        }

                        if (userPermissions && userPermissions[resource][action]) {
                            setStyle('')
                            return
                        }
                    }

                    if (node?.children?.length) node.children.pop()
                },
            },
        },
    },
}
