import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import Vue from 'vue'
import { abilitiesPlugin } from '@casl/vue'
import { Ability } from '@casl/ability'

export default defineNuxtPlugin((_ctx, inject) => {
    const ability = new Ability([])
    Vue.use(abilitiesPlugin, ability, {
        useGlobalProperties: true,
    })
    inject('ability', ability)
})
