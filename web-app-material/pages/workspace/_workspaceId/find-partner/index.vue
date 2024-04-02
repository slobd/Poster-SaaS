<template>
    <div class="page-wrapper grey lighten-4">
        <WebMetadata />
        <div class="page-header tw-py-2 tw-px-10">
            <h1 class="tw-font-bold tw-text-lg">Find a partner</h1>
        </div>
        <VDivider />

        <VContainer fluid class="tw-h-full tw-bg-gray-100 tw-text-left">
            <VRow class="tw-pl-2 tw-bg-gray-100 tw-text-xs tw-my-0 tw-z-0">
                <div class="col-12">
                    <div class="tw-py-3 col-12 tw-text-sm">
                        Find below a list of curated PosterLab partners that can help your next
                        collaboration.
                    </div>
                    <div class="tw-py-1 col-6">
                        <VTextField
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                            outlined
                            height="10"
                            dense
                        >
                        </VTextField>
                    </div>
                </div>
                <VDataTable
                    class="tw-bg-gray-100 col-12 tw-shadow-none"
                    :headers="headers"
                    :items="partners"
                    :search="search"
                >
                    <template #item.website="{ item }">
                        <VBtn
                            plain
                            :href="item.website"
                            target="_blank"
                            fab
                            class="tw-text-indigo-700"
                        >
                            WEBSITE
                            <FontAwesomeIcon :icon="icons.faExternalLink" class="tw-mx-1" />
                        </VBtn>
                    </template>
                </VDataTable>
            </VRow>
        </VContainer>
    </div>
</template>

<script lang="ts">
import {
    faGripHorizontal,
    faThList,
    faUpload,
    faSearch,
    faExternalLink,
} from '@fortawesome/pro-solid-svg-icons'
import { defineComponent } from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'FindPartnerIndex',
    setup() {
        const { icons } = useIcons({
            faGripHorizontal,
            faThList,
            faUpload,
            faSearch,
            faExternalLink,
        })

        const search = ''
        const headers = [
            {
                text: 'Company',
                align: 'start',
                sortable: false,
                value: 'company',
            },
            { text: 'Profile', value: 'profile' },
            { text: 'Core activity', value: 'core_activity' },
            { text: 'Industry', value: 'industry' },
            { text: 'Zone', value: 'zone' },
            { text: 'Membership', value: 'membership' },
            { text: '', value: 'website' },
        ]
        const partners = [
            {
                company: 'iED',
                profile: 'Association',
                core_activity: 'matchmaking',
                industry: 'All',
                zone: 'EU',
                membership: 'Partner',
                website: 'https://ied.eu/',
            },
            {
                company: 'IMG RLP',
                profile: 'Association',
                core_activity: 'matchmaking',
                industry: 'All',
                zone: 'EU',
                membership: 'Partner',
                website: 'https://www.img-rlp.de',
            },
            {
                company: 'KWT - Techno Transfer University des Saarlandes',
                profile: 'Techno-transfer',
                core_activity: 'techno-transfer',
                industry: 'All',
                zone: 'Germany',
                membership: 'Partner',
                website: 'https://www.kwt-uni-saarland.de/',
            },
            {
                company: 'Schlegel & Partner',
                profile: 'Consulting firm',
                core_activity: 'Matchmaking, Innovation',
                industry: 'Chemistry',
                zone: 'Germany',
                membership: 'Partner',
                website: 'https://www.schlegelundpartner.com/en/',
            },
            {
                company: 'ASAP (Association of Strategic Alliance Professionals)',
                profile: 'Association',
                core_activity: 'Knowledge, trends, networking',
                industry: 'All',
                zone: 'International',
                membership: 'Member',
                website: 'https://www.strategic-alliances.org/',
            },
            {
                company: 'TransMIT',
                profile: 'Association',
                core_activity: 'Knowledge, trends, networking',
                industry: 'All',
                zone: 'Germany',
                membership: 'Partner',
                website: 'https://www.transmit.de/',
            },
            {
                company: 'BioRN',
                profile: 'Association',
                core_activity: 'Knowledge, trends, networking',
                industry: 'Life science',
                zone: 'Germany',
                membership: 'Member',
                website: 'https://www.biorn.org/',
            },
            {
                company: '5-HT',
                profile: 'Association',
                core_activity: 'Knowledge, trends, networking',
                industry: 'Chemistry and life science',
                zone: 'Germany',
                membership: 'Member',
                website: 'https://www.5-ht.com/en',
            },
            {
                company: 'Vantage Partners',
                profile: 'Consulting firm',
                core_activity: 'Partnership/Alliance management',
                industry: 'All',
                zone: 'US',
                membership: 'Partner',
                website: 'https://www.vantagepartners.com/',
            },
            {
                company: 'AUFWERT',
                profile: 'Consulting firm',
                core_activity: 'Agile Innovation',
                industry: 'All',
                zone: 'Germany',
                membership: 'Partner',
                website: 'https://aufwert.com/',
            },
            {
                company: 'IN-PART',
                profile: 'Company',
                core_activity: 'matchmaking',
                industry: 'All',
                zone: 'International',
                membership: 'Recommendation',
                website: 'https://in-part.com/',
            },
        ]

        return {
            icons,
            search,
            headers,
            partners,
        }
    },
})
</script>

<style></style>
