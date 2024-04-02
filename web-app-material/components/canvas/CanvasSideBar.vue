<template>
    <div class="tw-flex tw-flex-col tw-items-start tw-py-8 tw-bg-gray-100" data-cy="VSideBar">
        <div class="tw-flex tw-flex-col tw-flex-1 tw-w-full tw-overflow-y-auto">
            <nav class="tw-flex-1">
                <hr class="tw-border-0" />
                <div v-for="(element, index) in navItems" :key="index">
                    <CanvasSideBarNavButton :to="element.to" :index="index">
                        <template v-if="numbered"> {{ index + 1 }}&nbsp; </template>
                        {{ element.text }}
                    </CanvasSideBarNavButton>
                </div>
            </nav>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
    props: {
        links: {
            type: Array,
            required: true,
        },
        submit: {
            type: String,
            default: '',
        },
        numbered: {
            type: Boolean,
            default: true,
        },
    },
    async fetch() {
        this.$store.commit('sidebar/setSubmit', this.submit)
        await this.$store.dispatch('sidebar/updateNavItems', {
            links: this.links,
            currentRoute: this.$route.path,
        })
    },

    // Great, but prevent component update. Bad for dynamic route.
    computed: {
        getIndex() {
            return this.$store.getters['sidebar/getIndex']
        },
        navItems() {
            return this.$store.getters['sidebar/getNavItems']
        },
    },
})
</script>
