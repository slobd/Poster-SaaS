import { Mail } from '../abstracts/mail.abstract'

export interface IEmailInvitationMailContext {
    inviteEmailUrl: string
    organization: string
}

export class EmailInvitationMail extends Mail {
    _subject = 'Invitation Email'
    _template = 'email-invitation'
    _from = 'hello@posterlab.co'
    _context: IEmailInvitationMailContext

    constructor(context: IEmailInvitationMailContext) {
        super(context)
    }
}
