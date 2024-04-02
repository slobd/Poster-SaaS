import {
    Controller,
    UseGuards,
    Body,
    Get,
    Res,
    Query,
    UseInterceptors,
    Patch,
    UploadedFile,
} from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { MulterS3File } from '@/uploads/types/MulterS3File'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { User as UserEntity } from '@/iam/users/entities/user.entity'
import { User } from '@/utils/decorators/user.decorator'
import { AuthProfilePatchHandler } from '@/auth/handlers/auth-profile-patch.handler'
import { RedirectUriHandler } from '@/auth/handlers/redirect-uri.handler'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/prisma/prisma.service'
import { UserWithAvatar } from '@/iam/users/user.repository'
import { AzureRedirect } from '@/azure/types'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly authProfilePatchHandler: AuthProfilePatchHandler,
        private readonly redirectUriHandler: RedirectUriHandler,
        private readonly configService: ConfigService,
        private prisma: PrismaService,
    ) {}

    // TODO: Should be users/:id/profiles
    @Patch('users/profiles')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateProfile(
        @Body() body: UpdateProfileDto,
        @User() user: UserEntity,
        @UploadedFile() file?: MulterS3File,
    ): Promise<UserWithAvatar> {
        return this.authProfilePatchHandler.handle(body, user, file)
    }

    // TODO: redirect-url (or uri) should be 
    @Get('redirect-uri')
    async azureLogin(
        @Res() res: Response,
        @Query('code') code: string,
        @Query('error') error: string,
    ) {
        if (error) {
            const client_url = this.configService.get('CLIENT_URL')
            console.trace(error)
            res.redirect(`${client_url}/auth/login`)
        } else {
            const redirectUrl = await this.redirectUriHandler.handle(
                code,
                AzureRedirect.SIGNUP_SIGNIN,
            )

            res.redirect(redirectUrl)
        }
    }

    @Get('redirect-register-uri')
    async azureRegister(
        @Res() res: Response,
        @Query('code') code: string,
        @Query('error') error: string,
    ): Promise<void> {
        if (error) {
            const client_url = this.configService.get('CLIENT_URL')
            console.trace(error)
            res.redirect(`${client_url}/auth/login`)
        } else {
            const redirectUrl = await this.redirectUriHandler.handle(
                code,
                AzureRedirect.SIGNUP_ONLY,
            )

            res.redirect(redirectUrl)
        }
    }

    @Get('reset-redirect-uri')
    async azurePasswordReset(
        @Res() res: Response,
        @Query('code') code: string,
        @Query('error') error: string,
    ): Promise<void> {
        if (error) {
            const client_url = this.configService.get('CLIENT_URL')
            console.trace(error)
            res.redirect(`${client_url}/auth/login`)
        } else {
            const redirectUrl = await this.redirectUriHandler.handle(
                code,
                AzureRedirect.PASSWORD_RESET,
            )

            res.redirect(redirectUrl)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(
        @User() user: SanitizedUserDto,
    ): Promise<UserWithAvatar | null> {
        return this.prisma.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                avatar: true,
                workspaces: true,
                skills: true,
                userAccount: {
                    include: {
                        identityProvider: true,
                    },
                },
            },
        })
    }
}
