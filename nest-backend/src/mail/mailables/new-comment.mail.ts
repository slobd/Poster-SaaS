import { Mail } from '../abstracts/mail.abstract'

export interface INewCommentContext {
    authorFirstName: string
    commenterName: string
    posterTitle: string
    content: string
    actionUrl: string
}

export class NewCommentMail extends Mail {
    _subject = 'You have a new comment'

    _from = 'no-reply@posterlab.co'

    _template = 'new-comment'

    _context: INewCommentContext

    constructor(context: INewCommentContext) {
        super(context)
    }
}
