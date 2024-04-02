import { INestApplicationContext } from '@nestjs/common'
import { UserRepository } from '@/iam/users/user.repository'
import { PosterRepository } from '@/posters/poster.repository'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PosterCreatedEvent } from '@/posters/events/poster-created.event'
import { UploadsService } from '@/uploads/uploads.service'
import * as fs from 'fs'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'

export async function uploadDemoPosters(
    app: INestApplicationContext,
    users: any[],
    workspaceId: number,
    posters: any[],
): Promise<void> {
    const userRepository = app.get(UserRepository)
    const posterRepository = app.get(PosterRepository)
    const eventEmitter = app.get(EventEmitter2)
    const uploadService = app.get(UploadsService)
    const configService = app.get(ConfigService)

    const pdfFiles = findFiles(process.cwd() + '/assets/gallery_docs', '.pdf')
    const coverImages = findFiles(
        process.cwd() + '/assets/gallery_docs',
        '.jpg',
    )

    for (const i in posters) {
        const user = await userRepository.findUnique({
            email: posters[i].user.email,
        })

        if (user) {
            const { pdf, image } = await uploadPosterAssets(
                user.email,
                pdfFiles[i],
                coverImages[i],
            )
            const workspace = { id: workspaceId }
            //const authors = [{id: user.id}]
            const authors = await findUsers(posters[i].authors, userRepository)
            try {
                const createdPoster = await posterRepository.create({
                    ...posters[i],
                    user,
                    authors,
                    workspace,
                    pdf,
                    image,
                })

                eventEmitter.emit(
                    PosterCreatedEvent.NAME,
                    new PosterCreatedEvent({
                        poster: createdPoster,
                    }),
                )
            } catch (error) {
                console.log(
                    `Error while seeding posters for user ${user.email}`,
                )
                console.error(error)
            }
        } else {
            console.log(`The user with the id ${users[i]} was not found`)
        }
    }

    function findFiles(startPath, filter) {
        if (!fs.existsSync(startPath)) {
            return
        }
        const files = fs.readdirSync(startPath)

        const fileList = []

        for (const i in files) {
            const filename = path.join(startPath, files[i])
            const stat = fs.lstatSync(filename)

            if (stat.isDirectory()) {
                findFiles(filename, filter) //recurse
            } else if (filename.indexOf(filter) >= 0) {
                fileList.push(filename)
            }
        }
        return fileList
    }

    async function uploadPosterAssets(
        email: string,
        pdfFile: string,
        coverFile: string,
    ): Promise<any> {
        const s3Bucket = configService.get('S3_BUCKET')
        const fileName = pdfFile.split('/').pop()
        const imageName = coverFile.split('/').pop()

        return {
            pdf: await uploadService.uploadfromLocal(
                pdfFile,
                s3Bucket,
                email + fileName,
            ),
            image: await uploadService.uploadfromLocal(
                coverFile,
                s3Bucket,
                email + imageName,
            ),
        }
    }

    async function findUsers(users: any[], userRepository: UserRepository) {
        const userList = []
        for (const user of users) {
            const dbUser = await userRepository.findUnique({
                email: user.email,
            })
            if (dbUser) userList.push({ id: dbUser.id })
        }
        return userList
    }
}
