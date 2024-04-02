import { Module } from '@nestjs/common'
import { MailController } from './mail.controller'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MailService } from './mail.service'
import * as path from 'path'
import * as SES from 'aws-sdk/clients/ses'
import { HttpModule } from '@nestjs/axios'

@Module({
    imports: [
        HttpModule,
        MailerModule.forRoot({
            transport: {
                // port: 1025,
                // ignoreTLS: true,
                SES: new SES({
                    region: 'eu-central-1',
                }),
            },
            defaults: {
                from: 'PosterLab',
            },
            template: {
                dir: path.join(process.cwd(), 'dist/mail/templates/'),
                adapter: new HandlebarsAdapter({
                    eq: (v1, v2) => v1 === v2,
                    ne: (v1, v2) => v1 !== v2,
                    lt: (v1, v2) => v1 < v2,
                    gt: (v1, v2) => v1 > v2,
                    lte: (v1, v2) => v1 <= v2,
                    gte: (v1, v2) => v1 >= v2,
                    and(...arg) {
                        arg.pop()

                        return arg.every(Boolean)
                    },
                    or(...arg) {
                        arg.pop()

                        return arg.some(Boolean)
                    },
                }),
                options: {
                    strict: true,
                },
            },
            options: {
                partials: {
                    dir: path.join(
                        process.cwd(),
                        'dist/mail/templates/partials',
                    ),
                    options: {
                        strict: true,
                    },
                },
            },
        }),
    ],
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
