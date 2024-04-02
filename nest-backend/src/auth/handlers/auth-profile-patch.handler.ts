import { Injectable } from '@nestjs/common'
import { UpdateProfileDto } from '@/auth/dto/update-profile.dto'
import { User as UserEntity } from '@/iam/users/entities/user.entity'
import { MulterS3File } from '@/uploads/types/MulterS3File'
import { AuthService } from '@/auth/auth.service'
import { UsersService } from '@/iam/users/users.service'
import { UploadsService } from '@/uploads/uploads.service'
import { omit } from 'lodash'
import { PrismaService } from '@/prisma/prisma.service'
import { UserWithAvatar } from '@/iam/users/user.repository'

@Injectable()
export class AuthProfilePatchHandler {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly uploadsService: UploadsService,
        private readonly prisma: PrismaService,
    ) {}

    async handle(
        body: UpdateProfileDto,
        user: UserEntity,
        file?: MulterS3File,
    ): Promise<UserWithAvatar> {
        const data: any = omit(body.data, ['avatar'])
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                avatar: true,
                skills: true,
            },
        })
        if (file) {
            const avatar = await this.authService.storeAvatarAsset(
                file,
                body.data,
            )
            if (avatar) {
                data.avatar = {
                    connect: {
                        id: avatar.id,
                    },
                }
            }
        } else {
            // Remove previous avatar from the user
            if (existingUser.avatar?.id && body.data.avatar === null) {
                await this.uploadsService.deleteUpload(existingUser.avatar)
            }
        }

        await this.usersService.update({ id: existingUser.id }, data)

        return this.prisma.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                avatar: true,
            },
        })
    }
}
