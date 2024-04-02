<template>
    <ValidationProvider v-slot="vp" :name="computedName" :vid="vid" :rules="rules" slim>
        <VTextarea
            :value="value"
            :label="label"
            :outlined="outlined"
            :rows="rows"
            :height="height"
            :counter="counter"
            :clearable="clearable"
            :hide-details="hideDetails"
            :error-messages="vp.errors"
            :maxlength="maxLength"
            auto-grow
            @input="$emit('input', $event)"
        ></VTextarea>
    </ValidationProvider>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { sharedInputProps, veeValidateProps } from '~/components/shared/inputs/VeeInputsProps'

export default defineComponent({
    name: 'VeeTextarea',
    props: {
        value: {
            type: String,
            required: true,
        },
        /**
         * Default row count
         */
        rows: {
            type: Number,
            default: 5,
        },
        /**
         * Default number of characters allowed
         */
        maxLength: {
            type: Number,
            default: 600,
        },
        ...sharedInputProps,
        ...veeValidateProps,
    },
    setup(props) {
        const computedName = computed(() => props.name || props.label)
        return {
            computedName,
        }
    },
})
</script>
