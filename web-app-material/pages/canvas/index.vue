<template>
    <div class="tw-h-auto tw-py-2">
        <div
            class="
                tw-flex tw-flex-col tw-items-center tw-px-8 tw-py-12
                md:tw-flex-row
                sm:tw-px-12
                md:tw-px-24
            "
        >
            <div class="tw-w-full tw-mb-4 md:tw-w-1/2 md:tw-mb-0">
                <h1 class="tw-mb-8 tw-text-2xl tw-text-left md:tw-text-3xl">
                    Create your
                    <span class="tw-border-b-8 tw-border-secondary">free</span>
                    Scientific Canvas
                </h1>
                <p class="tw-mb-3 tw-text-base md:tw-text-lg">
                    Your first practical and concise step to communicate
                    <br />
                    about your research.
                </p>
                <h2 class="tw-mb-2 tw-text-base md:tw-text-lg">
                    Why do you need to start with our Scientific Canvas?
                </h2>
                <ul
                    class="
                        tw-mx-auto tw-mt-6
                        text-sm
                        tw-leading-loose
                        md:tw-w-full
                        tw-pl-0 tw-list-none
                    "
                >
                    <li>
                        <FontAwesomeIcon :icon="icons.faCheck" class="tw-mr-2 text-secondary" />
                        Show your work in progress, share it with your peers
                    </li>
                    <li>
                        <FontAwesomeIcon
                            :icon="icons.faCheck"
                            class="tw-mr-2 text-secondary"
                        />&quot;No brainer&quot; follow the structure
                    </li>
                    <li>
                        <FontAwesomeIcon :icon="icons.faCheck" class="tw-mr-2 text-secondary" />
                        Take some time to reflect on where you stand in your research
                    </li>
                    <li>
                        <FontAwesomeIcon
                            :icon="icons.faCheck"
                            class="tw-mr-2 text-secondary"
                        />Totally secure.
                    </li>
                </ul>
            </div>
            <div class="tw-w-full tw-ml-2 md:tw-w-1/2">
                <img
                    class="tw-mx-auto tw-shadow-2xl tw-max-w-full"
                    src="~/static/canvas/canvas.png"
                    alt="Scientific Canvas Example"
                />
            </div>
        </div>
        <div class="tw-flex tw-flex-col tw-items-center tw-mb-16 tw-space-y-4">
            <NuxtLink to="/canvas/new/layout">
                <VBtn color="primary"> CREATE NEW CANVAS </VBtn>
            </NuxtLink>
        </div>
    </div>
</template>
<script>
import { defineComponent } from '@nuxtjs/composition-api'
import { faCheck } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    auth: false,
    setup() {
        const { icons } = useIcons({ faCheck })

        return {
            icons,
        }
    },
    data() {
        return {
            authenticated: this.$auth.loggedIn,
        }
    },
})
</script>
