export abstract class Mail {
    abstract _subject: string
    abstract _from: string
    abstract _template: string
    _context: Record<string, any>

    get subject(): string {
        return this._subject
    }

    get from(): string {
        return this._from
    }

    get template(): string {
        return './' + this._template
    }

    get context(): Record<string, any> {
        return this._context
    }

    constructor(context: Record<string, any>) {
        this._context = context
    }
}
