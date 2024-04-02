<template>
    <VChip v-if="name !== 'PUBLIC'" :color="colorVisibility()" small>{{ capitalize(name) }} </VChip>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import capitalize from 'lodash/capitalize'

export default defineComponent({
    name: 'VisibilityChip',
    props: {
        name: {
            type: String,
            default: 'PRIVATE',
        },
    },
    setup(props) {
        function colorVisibility() {
            const colorVisibility = {
                PUBLIC: 'green accent-1',
                PRIVATE: 'red lighten-4',
            }
            return colorVisibility[props.name]
        }
        return {
            colorVisibility,
            capitalize,
        }
    },
})
</script>
