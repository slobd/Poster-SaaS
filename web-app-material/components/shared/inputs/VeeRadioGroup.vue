<template>
    <ValidationProvider v-slot="vp" :name="computedName" :vid="vid" :rules="rules" slim>
        <VRadioGroup
            :value="value"
            :label="label"
            :error-messages="vp.errors"
            :row="row"
            @change="$emit('input', $event)"
        >
            <VRadio v-for="item in items" :key="item.label" :value="item.value">
                <template #label>
                    <div>{{ item.label }}</div>
                    <VTooltip v-if="item.hint" bottom>
                        <template #activator="{ on, attrs }">
                            <FontAwesomeIcon
                                v-bind="attrs"
                                class="tw-ml-2"
                                :icon="icons.faInfoCircle"
                                v-on="on"
                            />
                        </template>
                        <span>{{ item.hint }}</span>
                    </VTooltip>
                </template>
            </VRadio>
        </VRadioGroup>
    </ValidationProvider>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { sharedInputProps, veeValidateProps } from '~/components/shared/inputs/VeeInputsProps'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'VeeRadioGroup',
    props: {
        /**
         * Value of the currently selected radio
         */
        value: {
            type: String,
            required: true,
        },
        /**
         * Radio button configuration
         * Label: Sets input label
         * Value: The value used when the component is selected in a group. If not provided, the index will be used.
         * Hint: Display a hint icon with the given text next to the label
         */
        items: {
            type: Array as PropType<{ label: string; value: string; hint?: string }[]>,
            default: () => [],
        },
        row: {
            type: Boolean,
            default: false,
        },
        ...sharedInputProps,
        ...veeValidateProps,
    },
    setup(props) {
        const { icons } = useIcons({
            faInfoCircle,
        })

        const computedName = computed(() => props.name || props.label)

        return {
            icons,
            computedName,
        }
    },
})
</script>
