<template>
    <div
        class="
            tw-flex
            tw-flex-col
            tw-items-center
            tw-justify-center
            tw-w-full
            tw-h-full
            tw-text-pl-gray-5
        "
        style="width: 640px; height: 400px"
    >
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-flex-1 tw-space-y-14">
            <FontAwesomeIcon :icon="['fas', 'check']" class="tw-text-success" size="4x" />
            <h3 class="tw-text-2xl">You poster has been edited</h3>
            <div class="tw-flex tw-flex-row tw-space-x-4">
                <VBtn outlined @click="$router.push('/gallery')"> Gallery </VBtn>
                <VBtn color="primary" @click="$emit('input', '')"> Back to Poster </VBtn>
            </div>
        </div>
    </div>
</template>

<script>
export default {}
</script>

<style></style>
