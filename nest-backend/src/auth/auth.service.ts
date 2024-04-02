import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common'
import { DeepPartial } from 'typeorm'
import { Upload } from '@prisma/client'
import { UploadsService } from '@/uploads/uploads.service'
import { MulterS3File } from '@/uploads/types/MulterS3File'
import { UserWithAvatar } from '@/iam/users/user.repository'

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name)

    constructor(private readonly uploadsService: UploadsService) {}

    /**
     * TODO: Refactor auth.controller and make method private
     * @function storeAvatarAsset Check if the user avatar was send and store it
     * @param file Object returned by the MulterS3 middleware
     * @param user
     */
    public async storeAvatarAsset(
        file: MulterS3File & { id?: number },
        user: DeepPartial<UserWithAvatar>,
    ): Promise<Upload> {
        let avatar: Upload

        try {
            if (user?.avatar?.id) file.id = user.avatar.id

            avatar = await this.uploadsService.save(file)
        } catch (error) {
            this.logger.error('Error while saving user avatar', error.message)
            throw new InternalServerErrorException(error)
        }

        return avatar
    }
}
