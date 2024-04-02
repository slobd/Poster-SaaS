import { SendMessageUserRequestDto } from '@/mail/dto/send-message.dto'
import { Mail } from '../abstracts/mail.abstract'

export interface ISendMessageMailContext {
    message: string
    receiver: SendMessageUserRequestDto
    requester: SendMessageUserRequestDto
    workspaceName: string
    actionUrl: string
    orgMessage?: string
}

export class SendMessageMail extends Mail {
    _subject = 'You have a message from'

    _template = 'send-message'

    _from = 'no-reply@posterlab.co'

    _context: ISendMessageMailContext

    constructor(context: ISendMessageMailContext) {
        super(context)
        this._subject += ` ${context.requester.firstName} ${context.requester.lastName}`
        context.orgMessage = context.orgMessage || ''
        if (context.requester.organizationName){
            context.orgMessage += `from the organization ${context.requester.organizationName}`
        } else if (context.workspaceName) {
            context.orgMessage +=  `from the workspace ${context.workspaceName}`
        }

    }
}
