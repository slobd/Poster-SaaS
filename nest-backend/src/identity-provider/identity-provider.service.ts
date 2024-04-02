import { Injectable } from '@nestjs/common'
import { IdentityProviderRepository } from '@/identity-provider/identity-provider.repository'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'
import { PrismaService } from '@/prisma/prisma.service'
import { IdentityProvider } from '@prisma/client'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class IdentityProviderService {
    constructor(
        private readonly identityProviderRepository: IdentityProviderRepository,
        private readonly userAccountRepository: UserAccountRepository,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async findIdpFromEmail(email: string): Promise<IdentityProvider> {
        const domain = email.split('@')[1]
        const idp = await this.identityProviderRepository.findAll({
            domain: domain,
            enabled: true,
        })

        if (idp.length > 0) return idp[0]

        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        })
        if (!user) return

        const userAccount = await this.userAccountRepository.findMany({
            userId: user.id,
        })

        if (userAccount.length === 0) return

        const idpId = userAccount[0].identityProviderId

        const userIdp = await this.identityProviderRepository.findAll({
            id: idpId,
            enabled: true,
        })

        if (userIdp.length > 0) return userIdp[0]

        return
    }

    /**
     *
     * @param userSignedInIdp Can be "local" for local accounts,
     *                        can be the domain for SAML. OpenID...,
     *                        for microsoft work accounts it will be a string beginning with "https://login.microsoftonline.com/"
     * @param email
     */
    async findOrCreateIdentityProvider(
        userSignedInIdp: string,
        email: string,
    ): Promise<IdentityProvider> {
        const issuer = this.configService.get('LOCAL_ACCOUNT_ISSUER')

        if (userSignedInIdp === 'local') {
            // const idp = await this.identityProviderRepository.findOne({
            //     domain: email.split('@')[1],
            // })

            // if (!idp) {
            return await this.identityProviderRepository.findOne({
                domain: `${issuer}.onmicrosoft.com`,
            })
            // }
            //
            // return idp
        } else {
            // For the usual case where the IdP is following a using an auth standard SAML, OpenID, Oauth2
            // We check for idp configured in custom policies in Azure base on the domain of the IdP
            // For the MS AD cases userSignedInIdP will be https://login.microsoftonline.com/ so this won't return anything
            const ssoIdp = await this.identityProviderRepository.findOne({
                domain: userSignedInIdp,
            })

            if (ssoIdp) return ssoIdp

            /**
             * Handles dynamic Microsoft Work Account
             * TODO: Have to be worked on. See CU Task
             */
            const emailDomain = email.split('@')[1]

            /**
             * If a user previously logged with the same MS AD work account
             * there should be an IdP for it
             *
             * If there is a tenant with this domain it will return its IdP
             */
            const tenantIdp = await this.identityProviderRepository.findOne({
                domain: emailDomain,
            })

            // check for idp created for tenant domains
            if (tenantIdp) return tenantIdp

            /**
             * Handle user log ins with Microsoft Work Account and there is no tenant with a matching domain
             * nor has any user previously logged in with the same Microsoft Work Account Tenant
             */

            // TODO: Issue, there won't be any user directory
            // TODO: Throw error?
            const userDirectory = await this.prisma.userDirectory.findMany({
                where: {
                    domain: {
                        contains: emailDomain,
                    },
                },
            })

            if (userDirectory.length > 0) {
                return await this.createNewIDP(
                    email,
                    userSignedInIdp,
                    userDirectory,
                )
            } else {
                // TODO: Should not really be a local account because this was decide before
                return await this.identityProviderRepository.findOne({
                    domain: `${issuer}.onmicrosoft.com`,
                })
            }
        }
    }

    private async createNewIDP(
        email: string,
        userSignedInIdp: string,
        userDirectory,
    ) {
        return await this.identityProviderRepository.create({
            name: email.split('@')[0] + '_' + email.split('@')[1] + '_idp',
            domain: userSignedInIdp,
            userDirectory: {
                connect: {
                    id: userDirectory[0].id,
                },
            },
            userAccount: undefined,
        })
    }

    async fetchLocalIdp(): Promise<IdentityProvider> {
        return this.identityProviderRepository.findOne({
            name: 'local',
        })
    }
}
