<template>
    <VAppBar clipped-left fixed app color="white" height="100px" class="tw-px-20">
        <VToolbarTitle class="tw-flex tw-items-center">
            <VImg
                contain
                :src="primaryLogo"
                alt="PosterLab"
                height="2.5rem"
                width="11.5rem"
                max-height="2.5rem"
                max-width="11.5rem"
            />
            <VImg
                v-if="secondaryLogo"
                contain
                :src="secondaryLogo"
                alt="PosterLab"
                height="2.5rem"
                width="11.5rem"
                max-height="2.5rem"
                max-width="11.5rem"
            />
        </VToolbarTitle>
        <VSpacer />
        <VToolbarTitle>
            <div class="tw-inline-flex tw-items-center">
                <p class="tw-m-0 tw-text-base">Powered by</p>
                <a href=" https://posterlab.co/" target="_blank">
                    <VImg
                        contain
                        :src="require('~/assets/img/PosterLabLogo.svg')"
                        alt="PosterLab"
                        height="2.5rem"
                        width="11.5rem"
                        max-height="2.5rem"
                        max-width="11.5rem"
                    />
                </a>
            </div>
        </VToolbarTitle>
    </VAppBar>
</template>

<script>
import { defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
    layout: 'auth',
    setup() {
        const { $accessor } = useContext()

        const images = $accessor.tenant.getTheme?.images

        const primaryLogo = images?.primaryLogo?.url
            ? images?.primaryLogo?.url
            : images?.primaryLogo?.location

        const secondaryLogo = images?.secondaryLogo?.url
            ? images?.secondaryLogo?.url
            : images?.secondaryLogo?.location

        return {
            primaryLogo,
            secondaryLogo,
        }
    },
})
</script>

<style></style>
