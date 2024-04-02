import { computed } from '@nuxtjs/composition-api'
import { Icons } from '~/types/typing'

export default function useIcons(icons: Icons) {
    return {
        icons: computed(() => icons),
    }
}
