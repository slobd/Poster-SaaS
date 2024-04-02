import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { sanitizeUser } from '@/utils/helpers'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class UserMiddleware implements NestMiddleware {
    private readonly logger = new Logger(UserMiddleware.name)

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async use(req: Request, _res: Response, next: () => void): Promise<void> {
        // If there is no user in request and there is a Bearer token
        if (
            !req.user &&
            req.headers.authorization &&
            req.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
            const token = req.headers.authorization.split(' ')[1]
            try {
                const decodedToken = this.jwtService.verify(token)
                if (decodedToken.email) {
                    const user = await this.prisma.user.findUnique({
                        where: {
                            email: decodedToken.email,
                        },
                    })
                    req.user = sanitizeUser(user)
                }
                next()
            } catch (error) {
                // TODO: Renew token
                this.logger.error(null, error)
                next()
            }
        } else {
            next()
        }
    }
}
