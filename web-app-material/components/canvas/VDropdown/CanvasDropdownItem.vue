<template>
    <div data-cy="VDropdownItem">
        <nuxt-link
            v-if="to"
            class="
                tw-group tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700
                hover:tw-bg-gray-100 hover:tw-text-gray-900
                tw-cursor-pointer
            "
            role="menuitem"
            :to="to"
        >
            <FontAwesomeIcon
                v-if="icon"
                :icon="icon"
                class="tw-mr-3 tw-h-5 tw-w-5 tw-text-gray-400 group-hover:tw-text-gray-500"
            />
            {{ text }}
        </nuxt-link>
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: '',
        },
        icon: {
            type: Array,
            default: () => [],
        },
        to: {
            type: String,
            default: '',
        },
    },
}
</script>
