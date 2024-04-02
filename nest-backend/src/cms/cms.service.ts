import { TenantTheme } from '@/tenant/entities/tenant-theme.entity'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { DeepPartial } from 'typeorm'
import * as util from 'util'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class CmsService {
    private readonly url: string
    private readonly identifier: string
    private readonly password: string
    private defaultHeaders: Record<string, string>
    private token = ''

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.url = this.configService.get('CMS_URL')
        this.identifier = this.configService.get('CMS_USERNAME')
        this.password = this.configService.get('CMS_PASSWORD')
    }

    async findOneStrapiTenant(id: number): Promise<AxiosResponse<TenantTheme>> {
        if (!this.loggedIn()) {
            await this.login()
        }
        try {
            const cmsTenant = await this.httpService
                .get<TenantTheme>(`${this.url}/tenants/${id}`, {
                    headers: this.defaultHeaders,
                })
                .toPromise()

            return cmsTenant
        } catch (error) {
            console.error(
                'Error fetching One tenant from the CMS: ',
                error.response.data,
            )
            throw new InternalServerErrorException(
                'Error while creating tenant in the CMS',
            )
        }
    }

    async createStrapiTenant(
        body: TenantTheme,
    ): Promise<AxiosResponse<TenantTheme>> {
        if (!this.loggedIn()) {
            await this.login()
        }
        try {
            const cmsTenant = await this.httpService
                .post<TenantTheme>(`${this.url}/tenants`, body, {
                    headers: this.defaultHeaders,
                })
                .toPromise()

            return cmsTenant
        } catch (error) {
            console.error(
                'Error creating tenant in the CMS: ',
                error.response.data,
            )
            throw new InternalServerErrorException(
                'Error while creating tenant in the CMS',
            )
        }
    }

    async updateStrapiTenant(
        id: number,
        body: DeepPartial<TenantTheme>,
    ): Promise<AxiosResponse<TenantTheme>> {
        if (!this.loggedIn()) {
            await this.login()
        }
        try {
            const cmsTenant = await this.httpService
                .put<TenantTheme>(`${this.url}/tenants/${id}`, body, {
                    headers: this.defaultHeaders,
                })
                .toPromise()

            return cmsTenant
        } catch (error) {
            console.error('Error updating tenant in the CMS: ', error.response)
            throw new InternalServerErrorException(error)
        }
    }

    private async login() {
        try {
            const { data } = await this.httpService
                .post(`${this.url}/auth/local`, {
                    identifier: this.identifier,
                    password: this.password,
                })
                .toPromise()

            this.token = data.jwt
            this.defaultHeaders = {
                Authorization: `Bearer ${this.token}`,
            }
        } catch (error) {
            console.error('Error while login in to the CMS')
            console.error(util.inspect(error.response.data, { depth: null }))
            throw new InternalServerErrorException(
                'Error while login in to the CMS',
            )
        }
    }

    private loggedIn() {
        return !!this.token
    }
}
