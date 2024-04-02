import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as path from 'path'
import { Mail } from './abstracts/mail.abstract'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name)

    constructor(
        private readonly mailerService: MailerService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    async sendMail(
        mail: Mail,
        to: string | string[],
        tenantId: number,
    ): Promise<void> {
        try {
            // Tenant name and asset name muss match. i.e. if tenant name is Uni Saarland, logo name muss be uni_saarland
            const logoName = 'posterlab'

            const isOldenburgTenant = false

            console.log(tenantId)
            console.log(mail)

            const attachments: ISendMailOptions['attachments'] = [
                {
                    cid: logoName,
                    filename: `${logoName}.png`,
                    path: path.join(
                        process.cwd(),
                        `dist/mail/assets/${logoName}.png`,
                    ),
                },
            ]

            const isPosterlabTenant = true

            const tenant = {
                name: 'PosterLab',
                address: {
                    name: 'PosterLab',
                    slogan: 'Knowledge transferred. Fast.',
                    companyName: 'PL Digital GmbH i.G.',
                    street: 'Taunusstrasse',
                    houseNumber: '59 - 61',
                    zipCode: '55118',
                    more: 'Gutenberg Digital Hub e.V.',
                    city: 'Mainz',
                },
            }

            return this.mailerService
                .sendMail({
                    // list of receivers
                    to,
                    // sender address
                    from: `${tenant.name} <${
                        mail.from || 'no-reply@posterlab.co'
                    }>`,
                    subject: mail.subject, // Subject line
                    template: mail.template, // HTML body content
                    replyTo: mail.from || 'no-reply@posterlab.co',
                    attachments,
                    context: {
                        ...mail.context,
                        isPosterlab: isPosterlabTenant,
                        isOldenburg: isOldenburgTenant,
                        logo: logoName,
                        tenant,
                    },
                })
                .then(() => {
                    this.logger.debug('SUCCESS')
                    return null
                })
                .catch((e) => {
                    console.error(e)
                    return null
                })
        } catch (error) {
            console.error('MAIL SERVICE ERROR')
            console.error(error)
        }
    }

    async newsletter(email: string): Promise<void> {
        const username = this.configService.get('MAILCHIMP_USERNAME')
        const password = this.configService.get('MAILCHIMP_PASSWORD')
        if (username && password) {
            try {
                // TODO: Log response
                await this.httpService
                    .post(
                        'https://us20.api.mailchimp.com/3.0/lists/44faafc80f/members',
                        {
                            email_address: email,
                            status: 'subscribed',
                            merge_fields: {
                                MMERGE12: 'English',
                            },
                        },
                        {
                            auth: {
                                username,
                                password,
                            },
                        },
                    )
                    .toPromise()
            } catch (e) {
                // TODO: Use sentry
                this.logger.error('ERROR WHILE STORING EMAIL IN MAILCHIMP')
                if (e.response && e.response.data) {
                    this.logger.error(e.response.data)
                }
            } finally {
                return null
            }
        } else {
            this.logger.debug('Mailchimp env variables are missing')
            return null
        }
    }
}
