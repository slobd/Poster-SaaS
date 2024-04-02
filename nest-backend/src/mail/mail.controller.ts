import { Body, Controller, Post } from '@nestjs/common'
import { NewsletterDto } from './dto/newsletter.dto'
import { MailService } from './mail.service'
import { ApiTags } from '@nestjs/swagger'

@Controller('mail')
@ApiTags('Mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post('newsletter')
    async newsletter(@Body() body: NewsletterDto): Promise<void> {
        return this.mailService.newsletter(body.email)
    }
}
