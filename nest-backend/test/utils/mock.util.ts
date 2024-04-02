import { Actions } from '@/iam/iam.constants'
import * as request from 'supertest'

function getResourceAndAction(permission: [string, keyof typeof Actions]) {
    return {
        mockResource: permission[0].split('/')[0],
        mockAction: permission[1],
    }
}

export function mockEnforce(permissions: [string, keyof typeof Actions][]) {
    return async function (
        subject,
        domain,
        resource,
        action,
    ): Promise<boolean> {
        console.log('PERMISSIONS', permissions)
        for (const permission of permissions) {
            const { mockResource, mockAction } =
                getResourceAndAction(permission)
            if (
                (resource as string).includes(mockResource) &&
                action.includes(mockAction)
            ) {
                return true
            }
        }
        return false
    }
}

export function mockPolicyDecisionPoint(
    permissions: [string, keyof typeof Actions][],
) {
    return async function (req, rules): Promise<boolean> {
        console.log('PERMISSIONS', permissions)
        for (const permission of permissions) {
            const { mockResource, mockAction } =
                getResourceAndAction(permission)

            if (
                (rules[0] as string).includes(mockResource) &&
                rules[1].includes(mockAction)
            ) {
                return true
            }
        }
        return false
    }
}

export async function getRequest(
    route,
    server,
    tenantId,
    access_token,
    data = {},
) {
    console.log('routes : ', route)
    return request(server)
        .get(route)
        .send(data)
        .set({
            'x-tenant': tenantId,
            authorization: `Bearer ${access_token}`,
        })
}

export async function postRequest(
    route,
    server,
    tenantId,
    access_token,
    data = {},
) {
    console.log('routes : ', route)
    return request(server)
        .post(route)
        .send(data)
        .set({
            'x-tenant': tenantId,
            authorization: `Bearer ${access_token}`,
        })
}

export async function patchRequest(
    route,
    server,
    tenantId,
    access_token,
    data = {},
) {
    return request(server)
        .patch(route)
        .send(data)
        .set({
            'x-tenant': tenantId,
            authorization: `Bearer ${access_token}`,
        })
}

export async function deleteRequest(
    route,
    server,
    tenantId,
    access_token,
    data = {},
) {
    return request(server)
        .delete(route)
        .send(data)
        .set({
            'x-tenant': tenantId,
            authorization: `Bearer ${access_token}`,
        })
}

export function UrlEncoder(payload: Record<any, any>): string {
    let query = ''
    for (const [key, value] of Object.entries(payload)) {
        if (!Array.isArray(value)) {
            query = query + key + '=' + value + '&'
        } else {
            let subQuery = ''
            for (const subValue of value) {
                subQuery = key + '[]' + '=' + subValue + '&'
            }
            query = query + subQuery
        }
    }
    return query
}
