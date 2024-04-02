import { HttpService } from '@nestjs/axios'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as qs from 'qs'
import { AzureUser, AzureUserService } from '@/azure/azure-user.service'
import { AzureRedirect } from '@/azure/types'

@Injectable()
export class AzureActiveDirectoryB2CService {
    protected readonly azureClient

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly azureUserService: AzureUserService,
    ) {}

    async getAccessTokenFromAuthCode(
        authorization_code: string,
        type: AzureRedirect,
    ): Promise<string> {
        try {
            let policy = 'B2C_1A_SIGNUP_SIGNIN'
            if (type === AzureRedirect.SIGNUP_ONLY) {
                policy = 'B2C_1A_SIGN_UP_ONLY_EXECUTION'
            } else if (type === AzureRedirect.PASSWORD_RESET) {
                policy = 'B2C_1A_PASSWORDRESET'
            }
            const issuer = this.configService.get('LOCAL_ACCOUNT_ISSUER')
            const base_url = `https://${issuer}.b2clogin.com/${issuer}.onmicrosoft.com/${policy}/oauth2/v2.0/token`
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }

            /**
             *  TODO client_id and client_secret should be env variables
             */
            const data = qs.stringify({
                client_id: this.configService.get<string>(
                    'AZURE_AD_B2C_CLIENT_ID',
                ),
                client_secret: this.configService.get<string>(
                    'AZURE_AD_B2C_CLIENT_SECRET',
                ),
                grant_type: 'authorization_code',
                scope: 'openid offline_access https://graph.microsoft.com/.default',
                code: authorization_code,
                redirect_uri: this.configService.get<string>(
                    'AZURE_AD_B2C_REDIRECT_URI',
                ),
            })

            const response = await this.httpService
                .post(`${base_url}`, { data }, config)
                .toPromise()

            return response.data.id_token
        } catch (e) {
            throw new InternalServerErrorException(
                e,
                'Failed to exchange auth code for access token',
            )
        }
    }

    async findUserByToken(token: string): Promise<AzureUser> {
        const userInfo = this.parseJwt(token)
        const objectId = userInfo.sub
        console.log('objectid: ', objectId)
        return this.azureUserService.findOneUser(objectId)
    }

    getIdpNameFromToken(token: string): string {
        const userInfo = this.parseJwt(token)
        if (userInfo.idp) {
            return userInfo.idp
        } else return 'local'
    }

    private parseJwt(token): Record<string, any> {
        const base64Payload = token.split('.')[1]
        const payload = Buffer.from(base64Payload, 'base64')
        return JSON.parse(payload.toString())
    }
}
