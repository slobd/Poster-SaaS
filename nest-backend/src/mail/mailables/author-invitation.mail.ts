import { Mail } from '../abstracts/mail.abstract'

export interface IAuthorInvitationMailContext {
    mainAuthorFullName: string
    coAuthorFullName: string
    documentTitle: string
    tenantName: string
    actionUrl: string
}

export class AuthorInvitationMail extends Mail {
    _subject = 'Co-author invitation'
    _template = 'author-invitation'
    _from = 'no-reply@posterlab.co'
    _context: IAuthorInvitationMailContext
    constructor(context: IAuthorInvitationMailContext) {
        super(context)
    }
}
