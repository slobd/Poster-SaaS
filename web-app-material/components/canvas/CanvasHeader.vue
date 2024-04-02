<template>
    <div
        class="
            tw-flex
            tw-items-center
            tw-justify-between
            tw-flex-shrink-0
            tw-py-6
            tw-px-10
            tw-bg-white
            tw-shadow
        "
    >
        <h1 class="text-h5">
            <slot name="title"></slot>
        </h1>
        <div
            class="
                tw-flex
                tw-items-center
                tw-justify-end
                tw-flex-1
                tw-px-2
                tw-divide-x
                tw-divide-gray-400
            "
        >
            <slot name="buttons"></slot>
        </div>
    </div>
</template>
