import { Mail } from '../abstracts/mail.abstract'

export interface IAuthorNotificationMailContext {
    mainAuthorFullName: string
    coAuthorFullName: string
    documentTitle: string
    tenantName: string
    actionUrl: string // Should be the document url
}

export class EmailAuthorNotificationMail extends Mail {
    _subject = 'Co-author notification'
    _template = 'author-notification'
    _from = 'no-reply@posterlab.co'
    _context: IAuthorNotificationMailContext

    constructor(context: IAuthorNotificationMailContext) {
        super(context)
    }
}
