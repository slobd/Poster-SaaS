export interface Rule {
    id: number

    subject: string

    action: string

    fields: string | string[] | undefined

    options: object | null

    name: string

    feature: string

    roleId: number | null

    userId: number | null
}
