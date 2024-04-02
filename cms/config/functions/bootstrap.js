'use strict'

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

module.exports = async () => {
    const nestUser = await strapi.query('user', 'users-permissions').findOne({
        username: process.env.CMS_USERNAME,
    })

    const actions = ['update', 'create', 'findone', 'find']
    const authenticatedRolePermissions = await strapi
        .query('permission', 'users-permissions')
        .find({
            type: 'application',
            controller: 'tenant',
            role: 1,
        })

    authenticatedRolePermissions.forEach((permission) => {
        if (actions.includes(permission.action)) {
            permission.enabled = true
        }
    })

    for (const permission of authenticatedRolePermissions) {
        if (actions.includes(permission.action)) {
            try {
                await strapi
                    .query('permission', 'users-permissions')
                    .update({ id: permission.id }, permission)
            } catch (error) {
                console.log('error updating permission with id: ', permission.id)
                console.error(error)
            }
        }
    }

    if (!nestUser) {
        await strapi
            .query('user', 'users-permissions')
            .create({
                username: process.env.CMS_USERNAME,
                email: process.env.CMS_USERNAME,
                confirmed: true,
                blocked: false,
                provider: 'local',
                role: 1,
                password: await strapi.admin.services.auth.hashPassword(
                    process.env.CMS_PASSWORD
                ),
            })
            .then((res) => console.log(res))
            .catch((error) => console.error(error))
    } else {
        console.log('There is already a user with the following credentials')
        console.log({
            username: process.env.CMS_USERNAME,
            email: process.env.CMS_USERNAME,
        })
    }
}
