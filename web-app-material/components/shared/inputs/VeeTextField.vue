<template>
    <ValidationProvider
        v-slot="{ required, errors }"
        :name="computedName"
        :vid="vid"
        :rules="rules"
        slim
    >
        <VTextField
            :value="value"
            :label="getLabel(required)"
            :outlined="outlined"
            :clearable="clearable"
            :height="height"
            :hide-details="hideDetails"
            :error-messages="errors"
            :append-icon="appendIcon"
            :counter="counter"
            @input="$emit('input', $event)"
        ></VTextField>
    </ValidationProvider>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { sharedInputProps, veeValidateProps } from '~/components/shared/inputs/VeeInputsProps'

export default defineComponent({
    name: 'VeeTextField',
    props: {
        value: {
            type: String,
            required: true,
        },
        appendIcon: {
            type: String,
            default: '',
        },
        ...sharedInputProps,
        ...veeValidateProps,
    },
    setup(props) {
        const computedName = computed(() => props.name || props.label)
        const getLabel = (required: boolean) => {
            if (props.label) return required ? `${props.label?.trim()} *` : props.label?.trim()
        }
        return {
            computedName,
            getLabel,
        }
    },
})
</script>
