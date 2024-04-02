import { Context } from '@nuxt/types'
import { Route } from 'vue-router/types'
import { APIRoutes, TDPermission, TPermissions } from '~/types/typing'

/**
 * Check middleware/README.md for usage
 */
export default async function ({
    redirect,
    from = { fullPath: '/home' } as Route,
    $axios,
    route,
}: Context) {
    /**
     * Results of the /iam/can route.
     * For OR statement if there is SOME value that equals true the middleware allows the request
     * For AND statement if EVERY value are true the middleware allows the request
     */
    const results: boolean[] = []

    // Default for route.meta is undefined
    if (route.meta?.length && !route.meta[0].permissions) return

    const handleRequest = async (permissions: TDPermission) => {
        for await (const permission of permissions) {
            const [resource, resourceId, action] = permission

            if (resourceId === 'new') return

            const result = await $axios.post<boolean>(APIRoutes.IAM_CAN_USER, {
                resource,
                resourceId,
                action,
            })

            results.push(result.data)
        }
    }

    /**
     * Meta is an array with the meta property from all the matching routes
     */
    for (const index in route.meta) {
        const meta = route.meta[index]
        // Handle and array
        const permissions = meta.permissions(route)

        if (permissions?.length) {
            if (Array.isArray(permissions)) {
                await handleRequest(permissions)
                if (!results.every((value) => value)) return redirect(from.fullPath)
                return
            }
        }

        // It is/should be an object
        const permsCheck = Object.keys(permissions)
        if (permsCheck?.length) {
            const perms = permissions as TPermissions
            if (perms.and && perms.or) {
                throw new Error('Invalidad meta property. Cannot do OR and AND at the same time')
            }

            // Handle OR case
            if (perms.or) {
                await handleRequest(perms.or)
                if (!results.some((value) => value)) return redirect(from.fullPath)
                return
            }

            // Handle AND case
            if (perms.and) {
                await handleRequest(perms.and)
                if (!results.every((value) => value)) return redirect(from.fullPath)
                return
            }
        }
    }
}
