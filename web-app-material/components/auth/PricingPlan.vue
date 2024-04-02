<template>
    <VCard class="">
        <VCardText class="tw-pb-0">
            <VItemGroup v-model="pricingPlan" mandatory>
                <VContainer>
                    <VRow justify="center">
                        <VCol md="6">
                            <VItem>
                                <VCard class="tw-border-transparent">
                                    <VCardTitle
                                        color="primary"
                                        class="
                                            tw-justify-center tw-mb-5 tw-text-white tw-bg-primary
                                        "
                                    >
                                        Free premium trial
                                    </VCardTitle>
                                    <VCardText class="tw-pb-0">
                                        This plan has all the features you need to make your event a
                                        success. Try it out!
                                        <VList dense>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            1 event
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            Unlimited users
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            Custom branding
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            Gallery and participant overview
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            Role management
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            Manage invitations
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            10 GB upload
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                            <VListItem>
                                                <VListItemContent>
                                                    <VRow>
                                                        <VCol>
                                                            <FontAwesomeIcon
                                                                size="lg"
                                                                color="rgba(136,197,135,255)"
                                                                class="tw-mr-1"
                                                                :icon="icons.faCheckCircle"
                                                            />
                                                            GDPR compliant
                                                        </VCol>
                                                    </VRow>
                                                </VListItemContent>
                                            </VListItem>
                                        </VList>
                                    </VCardText>
                                    <VCardText v-if="firstEvent" class="tw-pt-0 tw-mt-0">
                                        Contact our team of experts for more personalized plans.
                                        <a target="_blank" :href="helpAndSupportUrl">Contact</a>
                                    </VCardText>
                                </VCard>
                            </VItem>
                        </VCol>
                    </VRow>
                </VContainer>
            </VItemGroup>
        </VCardText>
        <VCardText v-if="!firstEvent" class="tw-flex tw-justify-center tw-items-center">
            <VRow>
                <VCol class="tw-flex tw-justify-center tw-items-center">
                    <div
                        class="
                            tw-flex
                            tw-w-56
                            tw-font-medium
                            tw-justify-center
                            tw-text-center
                            tw-items-center
                        "
                    >
                        You have already created an event. Please contact our sales team
                    </div>
                </VCol>
            </VRow>
        </VCardText>
        <VCardActions class="tw-justify-center">
            <VBtn class="tw-w-32 tw-h-10 tw-mb-5" color="primary" @click="planContinue">{{
                planContinueButton
            }}</VBtn>
        </VCardActions>
    </VCard>
</template>
<script lang="ts">
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons'
import { defineComponent } from '@nuxtjs/composition-api'
import { onMounted, ref } from '@vue/composition-api'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    setup(_props, { emit }) {
        const planContinueButton = ref('Continue')
        const firstEvent = ref(true)
        const pricingPlan = ref(1)
        const customizationEditable = ref(false)
        const helpAndSupportUrl = ''
        // Method
        function planContinue() {
            if (firstEvent.value) emit('next-step', 3)
            else window.open(helpAndSupportUrl, '_blank')
        }

        function _checkEligibility() {
            customizationEditable.value = true
            return null
        }

        onMounted(_checkEligibility)

        // Computed

        const { icons } = useIcons({ faCheckCircle })
        return {
            pricingPlan,
            firstEvent,
            planContinueButton,
            helpAndSupportUrl,
            planContinue,
            icons,
        }
    },
})
</script>
