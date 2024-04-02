import { tenantMockTemplate } from './mock/tenant'
import { mockPosters } from './mock/poster'
import { APIRoutes } from '~/types/typing'

const apiRoutes = <T extends Record<string, any>>(
    route: APIRoutes,
    count: number = 10,
    config = {} as T
): T => {
    const routesMap = {
        [APIRoutes.TENANT_BY_ORIGIN]: () =>
            tenantMockTemplate({
                posters: [],
                ...config,
            }),
        // [APIRoutes.TENANT_BY_INFO]: () =>
        //     tenantMockTemplate({
        //         posters: [],
        //         ...config,
        //     }),

        // [APIRoutes.COMMENTS]: () =>
        //    mockComments(count, {
        //        ...config,
        //    }),

        [APIRoutes.POSTERS]: () =>
            mockPosters(count, {
                ...config,
            }),
    }
    // Lazy Load
    return routesMap[route]()
}

export default apiRoutes
