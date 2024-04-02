import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import JwtPayload from '../interfaces/jwt-payload'
import { PrismaService } from '@/prisma/prisma.service'
import { sanitizeUser } from '@/utils/helpers'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly prisma: PrismaService,
        readonly config: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET'),
        })
    }

    /**
     *
     * @param payload Decoded jwt token. Created at AuthService.login()
     */
    async validate(payload: JwtPayload): Promise<SanitizedUserDto> {
        const { email } = payload
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        })
        return sanitizeUser(user)
    }
}
