<template>
    <div
        class="tw-flex tw-flex-col tw-items-start tw-justify-between tw-py-8 md:tw-flex-row"
        data-cy="CanvasIdHeader"
    >
        <h3 class="tw-text-2xl">
            <slot></slot>
        </h3>

        <!-- If the store passes a next.text but not a next.to the button will work as a normal button instead of a nuxt-link -->
        <CanvasNavUtility
            class="tw-mt-4 lg:tw-mt-0"
            :next-loading="nextLoading"
            @click="$emit('click')"
        />
    </div>
</template>

<script>
export default {
    props: {
        nextLoading: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style></style>
