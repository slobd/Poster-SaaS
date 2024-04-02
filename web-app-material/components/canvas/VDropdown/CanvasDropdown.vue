<template>
    <div class="tw-flex tw-items-center tw-pr-2" data-cy="VDropdown">
        <div class="tw-w-full tw-text-right">
            <div
                v-click-outside="close"
                class="tw-relative tw-inline-block tw-text-left tw-w-full"
                @keydown.escape="close"
            >
                <slot name="button" :click="() => (open = true)">
                    <!-- To define custom button, use template. don't forget to set the click props for open. -->
                    <VBtn
                        tooltip="Share"
                        aria-haspopup="true"
                        aria-expanded="true"
                        x-bind:aria-expanded="open"
                        simple
                        size="xs"
                        rounded
                        outlined
                        class="tw-my-1 tw-py-2 tw-h-8"
                        :icon="icon"
                        @click="open = !open"
                    >
                        {{ title }}
                    </VBtn>
                </slot>

                <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                >
                    <div
                        v-if="open"
                        x-description="Dropdown panel, show/hide based on dropdown state."
                        class="
                            tw-origin-top-left
                            tw-absolute
                            tw-left-0
                            tw-mt-2
                            tw-rounded-md
                            tw-shadow-lg
                            tw-bg-white
                            tw-ring-1
                            tw-ring-black
                            tw-ring-opacity-5
                            tw-divide-y
                            tw-divide-gray-100
                            tw-z-10
                            tw-w-full
                            tw-min-w-max
                        "
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        <!-- Don't want to use the custom content? Just provide your template. -->
                        <slot name="content" data-cy="VDropdownContent">
                            <span v-for="(item, index) in content" :key="index">
                                <!-- Only provide the nuxt-link for changing routes See VDropdownItem-->
                                <CanvasDropdownItem
                                    :text="item.text"
                                    :icon="item.icon"
                                    :to="item.to"
                                />
                            </span>
                        </slot>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: '',
        },
        icon: {
            type: Array,
            // Don't like the default icon, just provide your own or use #button template.
            default: () => ['fas', 'share-alt'],
        },
        content: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            open: false,
        }
    },
    methods: {
        close() {
            this.open = false
        },
    },
}
</script>
