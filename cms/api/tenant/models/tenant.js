'use strict'
const axios = require('axios').default
const { without } = require('lodash')
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            if (data.domain) {
                const newDomainList = data.domain.split(',')
                const tenants = await strapi.query('tenant').find()
                //Check for each domain in all existing tenants
                for (const domain of newDomainList) {
                    this.validateDomainIsUnique(domain, tenants)
                }
            }
        },
        validateDomainIsUnique(domain, tenants) {
            for (const tenant of tenants) {
                if (!tenant.domain) continue

                const domainList = tenant.domain.split(',')
                if (domainList.findIndex((d) => d === domain) !== -1) {
                    throw strapi.errors.badRequest(
                        `Each domain should be unique. ${domain} already exists.`,
                    )
                }
            }
        },
        async beforeUpdate(id, data) {
            console.log(
                '========================================================',
            )
            console.log('BEFORE UPDATE', id)

            const cmsTenant = await strapi.query('tenant').findOne(id)

            if (!this.isDomainDifferent(cmsTenant.domain, data.domain)) return

            const updateDomains = data.domain

            const oldDomains = cmsTenant.domain

            const tenants = await strapi.query('tenant').find()

            if (!this.isValidDomain(oldDomains,updateDomains))
                throw strapi.errors.badRequest(
                    'Already existing domains cannot be updated',
                )

            const removeEmptyElements = this.cleanNewDomains(oldDomains, updateDomains)

            if (removeEmptyElements.length === 0) return

            for (const domain of removeEmptyElements) {
                // Check for duplicate entries in new domain list compared to old domain list
                if (oldDomains && oldDomains.includes(domain))
                    throw strapi.errors.badRequest(
                        `Each domain should be unique. ${domain} already exists.`,
                    )

                //Check for each domain in all existing tenants
                this.eachDomainCheckAgainstAllTenants(tenants, domain)
            }

            this.checkForDuplicateEntriesAmongNewDomains(removeEmptyElements)
        },
        isDomainDifferent(oldDomain, newDomain) {
            return !!(oldDomain && newDomain && newDomain !== oldDomain)
        },
        isValidDomain(oldDomains, updateDomains) {
            return !!(updateDomains.includes(oldDomains) || !oldDomains)
        },
        cleanNewDomains(oldDomains, updateDomains) {
            const newDomains = updateDomains
                .replace(oldDomains, '')
                .split(',')
            return  without(newDomains, '')
        },
        eachDomainCheckAgainstAllTenants(tenants, domain) {
            for (const tenant of tenants) {
                if (!tenant.domain) continue
                const domainList = tenant.domain.split(',')
                if (
                    domainList.findIndex(
                        (d) => d === domain,
                    ) !== -1
                ) {
                    throw strapi.errors.badRequest(
                        `Each domain should be unique. ${domain} already exists.`,
                    )
                }
            }
        },
        checkForDuplicateEntriesAmongNewDomains(domainArray) {
            const dup = domainArray.filter(
                (item, index) =>
                    domainArray.indexOf(item) !== index,
            )
            // Check for duplicate entries in the new domain list
            if (dup.length > 0)
                throw strapi.errors.badRequest(
                    `Each domain should be unique.`,
                )
        },
        async afterUpdate(result, params, data) {
            if (data.published_at || result.published_at) {
                console.log('DOC WAS PUBLISHED OR SAVED A PUBLISHED VERSION')
                console.log('DATA', data)
                console.log('PARAMS', params)
                console.log('RESULT result', result)

                const tenant = {
                    name: result.name,
                    host: result.host,
                    domain: result.domain,
                    superadmin: result.superadmin,
                    themeId: result.id,
                    features: result.features,
                    superadminEmail: result.superadmin.email,
                    enabled: result.enabled,
                }

                let nestTenant
                try {
                    nestTenant = await axios.get(
                        process.env.BACKEND_URL + '/tenants',
                        {
                            params: {
                                themeId: result.id,
                            },
                        },
                    )
                } catch (error) {
                    console.log('Error while fetching tenant')
                    console.error(error.response.data)
                    throw error
                }

                console.log('fetched tenant:', nestTenant.data)
                if (nestTenant.data) {
                    // Avoid unique value validation error
                    if (nestTenant.data.name === tenant.name) delete tenant.name
                    if (nestTenant.data.host === tenant.host) delete tenant.host
                    if (tenant.features)
                        tenant.features.id = nestTenant.data.features.id

                    try {
                        await axios.patch(
                            process.env.BACKEND_URL +
                                '/tenants/cms/' +
                                nestTenant.data.id,
                            tenant,
                        )
                    } catch (error) {
                        console.log('Error while updating tenant')
                        console.error(error.response.data)
                    }
                } else {
                    try {
                        await axios.post(
                            process.env.BACKEND_URL + '/tenants/cms',
                            tenant,
                        )
                    } catch (error) {
                        console.log('Error while creating tenant')
                        console.error(error.response)
                    }
                }
            } else if (data.published_at === null) {
                console.log('DOC WAS UNPUBLISHED')
            } else {
                console.log('SAVED AN UNPUBLISHED VERSION')
            }
        },
    },
}
