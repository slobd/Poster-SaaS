import { Module } from '@nestjs/common'
import { BoardService } from './board.service'
import { BoardController } from './board.controller'
import { BoardRepository } from '@/board/board.repository'
import { UploadsModule } from '@/uploads/uploads.module'
import { TaskModule } from '@/task/task.module'

@Module({
    imports: [UploadsModule, TaskModule],
    controllers: [BoardController],
    providers: [BoardService, BoardRepository],
})
export class BoardModule {}
