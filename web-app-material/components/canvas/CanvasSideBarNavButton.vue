<template>
    <div
        class="tw-cursor-pointer"
        data-cy="VSideBarNavButton"
        @click="$store.dispatch('sidebar/updateIndex', { index })"
    >
        <nuxt-link v-slot="{ isActive, navigate }" class="" :to="to" exact custom>
            <span
                class="
                    tw-flex
                    tw-items-center
                    tw-justify-between
                    tw-p-2
                    tw-my-2
                    tw-text-sm
                    tw-font-medium
                    tw-leading-5
                    tw-transition
                    tw-duration-150
                    tw-ease-in-out
                    tw-bg-white
                    tw-rounded-md
                    tw-focus:outline-none tw-focus:text-white tw-focus:bg-gray-400
                "
                :class="isActive ? 'tw-text-white tw-bg-gray-400' : 'hover:tw-bg-pl-gray-2 '"
                @click="navigate"
            >
                <slot></slot>
            </span>
        </nuxt-link>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        to: {
            type: String,
            default: '/',
        },
        index: {
            type: Number,
            required: true,
        },
    },
})
</script>
