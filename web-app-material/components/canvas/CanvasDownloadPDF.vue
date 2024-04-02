<template>
    <ValidationObserver v-slot="{ handleSubmit }" tag="div" class="py-8">
        <h3 class="tw-mb-4 tw-text-xl tw-text-left">Dowload PDF</h3>
        <p class="tw-text-sm">Download starts immediately after clicking the button below.</p>
        <VRow v-if="!$auth.loggedIn" class="tw-w-full" no-gutters dense>
            <VCol cols="12">
                <VeeTextField
                    v-model="email"
                    rules="required"
                    label="Insert your work email"
                    vid="email"
                    class="tw-w-1/2"
                    hide-details="auto"
                    required
                    outlined
                    append-icon="mdi-email-open"
                    bordered
                />
            </VCol>
            <VCol cols="12" class="tw-py-0 tw-my-2">
                <ValidationProvider
                    v-slot="{ errors }"
                    :rules="{ required: { allowFalse: false } }"
                    name="Privacy Policy"
                    mode="eager"
                    slim
                >
                    <div class="tw-h-4 text-sm">
                        <VCheckbox
                            id="policy"
                            v-model="policy"
                            value="policy"
                            :checked="policy"
                            :error="errors[0]"
                            dense
                            label="By clicking Download you agree to PosterLab's Privacy Policy"
                        ></VCheckbox>
                        <p v-if="errors[0]" class="tw-px-3 tw-text-xs tw-text-red-600">
                            {{ errors[0] }}
                        </p>
                    </div>
                </ValidationProvider>
            </VCol>
            <VCol cols="12" class="tw-py-0 tw-my-0">
                <div class="tw-text-sm">
                    <VCheckbox
                        id="newsletter"
                        value="newsletter"
                        :checked="newsletter"
                        dense
                        label="I agree to my email being stored and used to receive the newsletter"
                        @change="newsletter = !newsletter"
                    ></VCheckbox>
                </div>
            </VCol>
            <VCol cols="12" class="tw-py-0 tw-my-0">
                <VBtn color="primary" class="" @click.prevent="handleSubmit(downloadPDF)">
                    Download
                    <!-- :icon="['fas', 'file-download']" -->
                </VBtn>
            </VCol>
        </VRow>
        <VBtn v-else color="primary" class="tw-mt-6" @click.prevent="downloadPDF"> Download </VBtn>
    </ValidationObserver>
</template>

<script>
// Auto import wasn't working with this component
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { generateCanvasTitle } from '~/composables/canvas/use/useUtils'
import newUsePDF from '~/composables/canvas/use/newUsePDF'
pdfMake.vfs = pdfFonts.pdfMake.vfs

export default Vue.extend({
    components: {
        ValidationProvider,
        ValidationObserver,
    },
    data() {
        return {
            policy: false,
            newsletter: false,
            email: '',
        }
    },
    computed: {
        ...mapGetters('canvas', {
            layout: 'getLayout',
            title: 'getTitle',
            blocks: 'getBlocks',
            authors: 'getAuthors',
            color: 'getCategory',
            findingBlock: 'getFindingBlock',
        }),
    },
    methods: {
        async downloadPDF() {
            if (this.newsletter) {
                await this.$axios.$post('/mail/newsletter', {
                    email: this.email,
                })
            }

            const PDFDefinitions = await newUsePDF({
                layout: this.layout,
                blocks: this.blocks,
                title: this.title,
                authors: this.authors,
                findingBlock: this.findingBlock,
                morrisonBgColor: this.color,
            })
            const pdfDocGenerator = pdfMake.createPdf(PDFDefinitions)
            pdfDocGenerator.download(`${generateCanvasTitle(this.title)}.pdf`)
        },
    },
})
</script>

<style></style>
