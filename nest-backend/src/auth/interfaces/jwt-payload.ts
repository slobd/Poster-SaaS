export default interface JwtPayload {
    /**
     * User's email
     */
    email: string

    /**
     * User's id
     */
    sub: number

    /**
     * Object id
     */
    issuer: string
}
