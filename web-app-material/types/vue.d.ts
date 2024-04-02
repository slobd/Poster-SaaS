// 1. Make sure to import 'vue' before declaring augmented types
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { Auth as NuxtAuth } from '@nuxtjs/auth-next'
import VueRouter from 'vue-router'
import * as SentryTypes from '@sentry/minimal'
import { NuxtCookies } from 'cookie-universal-nuxt'
import pino from 'pino'
import { Ability } from '@casl/ability'
import { User } from './entities/User.entity'
import { Accessor } from '~/store'
import { DefaultApi } from '~/plugins/api'

// 2. Specify a file with the types you want to augment
//    Vue has the constructor type in types/vue.d.ts
declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $cookies: NuxtCookies
        $accessor: Accessor
        $logger: pino.Logger
    }

    interface Auth extends NuxtAuth {
        user: User & typeof NuxtAuth.prototype.user
    }
}

declare module '@nuxt/types' {
    interface Context {
        readonly $sentry: typeof SentryTypes
        $logger: pino.Logger
        $accessor: Accessor
        $api: DefaultApi
    }

    interface NuxtAppOptions {
        $accessor: Accessor
        $api: DefaultApi
    }

    interface Auth extends NuxtAuth {
        user: User & typeof NuxtAuth.prototype.user
    }
}

declare module 'vuex/types/index' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Store<S> {
        $accessor: Accessor
        $logger: pino.Logger
        $router: VueRouter
        $cookies: NuxtCookies
        readonly $sentry: typeof SentryTypes
        $segment: any
        $ability: Ability
        $api: DefaultApi
    }

    interface Auth extends NuxtAuth {
        user: User & typeof NuxtAuth.prototype.user
    }
}
