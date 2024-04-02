<template>
    <ValidationProvider v-slot="vp" :name="label" :vid="vid" :rules="rules" slim>
        <VFileInput
            :value="value"
            :accept="accept"
            :label="label"
            :outlined="outlined"
            :hint="hint"
            :persistent-hint="persistentHint"
            :clearable="clearable"
            :hide-details="hideDetails"
            :error-messages="vp.errors"
            @change="$emit('change', $event)"
        />
    </ValidationProvider>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { sharedInputProps, veeValidateProps } from '~/components/shared/inputs/VeeInputsProps'

export default defineComponent({
    name: 'VeeFileInput',
    model: {
        event: 'change',
    },
    props: {
        // File constructor is not defined in nodejs
        // eslint-disable-next-line vue/require-prop-types
        value: {
            required: false,
            default: null,
        },
        accept: {
            type: String,
            default: '*',
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
