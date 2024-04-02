import { PosterCreatedListener } from '@/access-control/listeners/poster-created.listener'
import { PosterUpdatedListener } from '@/access-control/listeners/poster-updated.listener'
import { PosterDeletedListener } from '@/access-control/listeners/poster-deleted.listener'

export const AccessControlListeners = [
    PosterCreatedListener,
    PosterUpdatedListener,
    PosterDeletedListener,
]
