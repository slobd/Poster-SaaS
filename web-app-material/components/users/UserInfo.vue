<template>
    <VCard class="tw-h-full tw-p-4 blue-grey lighten-5 text-start">
        <h3 class="tw-text-lg tw-mb-2">ABOUT ME</h3>
        <div v-if="user && user.organizationName" class="tw-mb-3">
            <h2 class="tw-text-base">Organization</h2>
            <p class="text-xs">
                {{ user && user.organizationName }}
            </p>
        </div>

        <div v-if="user && user.currentPosition" class="tw-mb-3">
            <h2 class="tw-text-base">Position</h2>
            <p class="text-xs">
                {{ user && user.currentPosition }}
            </p>
        </div>
        <div v-if="user && user.skills && user.skills.length" class="tw-mb-3">
            <h2 class="tw-text-base">Skills</h2>
            <VChip
                v-for="(skill, index) in user && user.skills"
                :key="`${index}-skill-${skill}`"
                :ripple="false"
                label
                color="lighten-4"
                class="tw-mr-1 tw-mb-1"
                small
            >
                {{ skill.name }}
            </VChip>
        </div>
        <div v-if="user && user.biography" class="tw-mb-3">
            <h2 class="tw-text-base">Biography</h2>
            <p class="text-xs">
                {{ user && user.biography }}
            </p>
        </div>

        <div v-if="user && user.topics && user.topics.length" class="tw-mb-3">
            <h2 class="tw-text-base">Topics</h2>
            <VChip
                v-for="(topic, index) in user && user.topics"
                :key="`${index}-topic-${topic}`"
                :ripple="false"
                label
                color="cyan lighten-4"
                class="tw-mr-1 tw-mb-1"
                small
            >
                {{ topic }}
            </VChip>
        </div>
        <div v-if="user && user.keywords && user.keywords.length" class="tw-mb-3">
            <h2 class="tw-text-base">Keywords</h2>
            <VChip
                v-for="(keyword, index) in user && user.keywords"
                :key="`${index}-keyword-${keyword}`"
                :ripple="false"
                label
                color="cyan lighten-5"
                class="tw-mr-1 tw-mb-1"
                small
            >
                {{ keyword }}
            </VChip>
        </div>
        <div v-if="user && (user.linkedin || user.researchGate || user.twitter)" class="tw-mb-3">
            <h2 class="tw-text-base">Social links</h2>
            <VTooltip bottom>
                <template #activator="{ on, attrs }">
                    <VBtn
                        v-if="user.linkedin"
                        icon
                        :href="user.linkedin"
                        target="_blank"
                        class="tw-ml-0"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            class="tw-mx-1 tw-text-xl tw-text-gray-500"
                            :icon="icons.faLinkedin"
                        />
                    </VBtn>
                </template>
                <span>linkedin</span>
            </VTooltip>
            <VTooltip bottom>
                <template #activator="{ on, attrs }">
                    <VBtn
                        v-if="user.researchGate"
                        icon
                        :href="user.researchGate"
                        target="_blank"
                        class="tw-ml-0"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            class="tw-mx-1 tw-text-xl tw-text-gray-500"
                            :icon="icons.faResearchgate"
                        />
                    </VBtn>
                </template>
                <span>researchGate</span>
            </VTooltip>
            <VTooltip bottom>
                <template #activator="{ on, attrs }">
                    <VBtn
                        v-if="user.twitter"
                        icon
                        :href="user.twitter"
                        target="_blank"
                        class="tw-ml-0"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            class="tw-mx-1 tw-text-xl tw-text-gray-500"
                            :icon="icons.faTwitter"
                        />
                    </VBtn>
                </template>
                <span>twitter</span>
            </VTooltip>
        </div>
    </VCard>
</template>

<script lang="ts">
import { faLinkedin, faResearchgate, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'
import { IExpert } from '~/types/experts'

export default defineComponent({
    name: 'UserInfo',
    props: {
        user: {
            type: Object as PropType<IExpert>,
            default: () => {},
            required: true,
        },
    },
    setup() {
        const { icons } = useIcons({
            faLinkedin,
            faResearchgate,
            faTwitter,
        })
        return {
            icons,
        }
    },
})
</script>

<style></style>
