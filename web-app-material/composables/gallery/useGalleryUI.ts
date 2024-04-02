import { computed, ref } from '@nuxtjs/composition-api'
import { GalleryLayout } from '~/constants/gallery.constants'

export default function useGalleryUI() {
    // refs
    const layout = ref(GalleryLayout.GRID)

    const showGallery = computed(() => ({
        table: _showGalleryTable.value,
        grid: _showGalleryGrid.value,
    }))
    const _showGalleryTable = computed((): boolean => {
        return layout.value === GalleryLayout.TABLE
    })
    const _showGalleryGrid = computed((): boolean => {
        return layout.value === GalleryLayout.GRID
    })

    return {
        // refs
        layout,
        showGallery,
    }
}
