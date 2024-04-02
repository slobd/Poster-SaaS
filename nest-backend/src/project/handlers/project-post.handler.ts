import { Injectable } from '@nestjs/common'
import { ProjectRepository } from '@/project/project.repository'
import { CreateProjectDto } from '../dto/create-project.dto'
import { Project } from '@/project/project.types'

@Injectable()
export class ProjectPostHandler {
    constructor(private readonly projectRepository: ProjectRepository) {}

    async handle(body: CreateProjectDto, ownerId: number): Promise<Project> {
        return this.projectRepository.create({
            ...body,
            ownerId,
        })
    }
}
