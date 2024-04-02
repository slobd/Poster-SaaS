import { computed } from '@nuxtjs/composition-api'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'

export default function useVisibility() {
    const visibilities = computed(() => [
        {
            label: 'Public',
            value: 'PUBLIC',
            hint: 'Visible by anyone with access to the gallery',
        },
        {
            label: 'My Organization',
            value: 'ORGANIZATION',
            hint: 'Only members of your organization can see this document',
        },
        {
            label: 'Private',
            value: 'PRIVATE',
            hint: 'Only visible by you and your co-authors',
        },
    ])

    const getDefaultVisibility = computed(() => {
        return PosterVisibilityEnum.PUBLIC
    })

    return {
        visibilities,
        getDefaultVisibility,
    }
}
