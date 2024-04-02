import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { BoardRepository } from '@/board/board.repository'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { FindBoardDto } from '@/board/dto/find-board.dto'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { Board } from '@/board/entities/board.entity'
import { CreateBoardDto } from './dto/create-board.dto'
import { BoardService } from './board.service'
import { UpdateBoardDto } from './dto/update-board.dto'

@Controller('boards')
@ApiTags('Boards')
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class BoardController {
    constructor(
        private readonly boardRepository: BoardRepository,
        private readonly boardService: BoardService,
    ) {}
    /**
     * Project role:
     * Board.projectId = $projectId
     * Workspace role:
     * Board.Project.visibility  PUBLIC
     * Board.Project.workspaceId = $workspaceId
     */
    @Get(':id')
    @Policy({
        action: ActionEnum.read,
        subject: SubjectEnum.Board,
    })
    @ApiOperation({
        operationId: 'find_one_board',
    })
    async findOne(@Param('id') id: string): Promise<Board> {
        return this.boardRepository.findOne({ id: parseInt(id) })
    }

    @Get()
    @ApiOperation({
        operationId: 'find_many_board',
        description: 'Dev only',
    })
    @UseGuards(IsDevGuard)
    async findMany(@Query() query: FindBoardDto): Promise<Board[]> {
        return this.boardRepository.findMany(query)
    }

    @Post()
    @ApiOperation({
        operationId: 'create_task_board',
        description: 'Create new task board',
    })
    @Policy({
        action: ActionEnum.create,
        subject: SubjectEnum.Board,
    })
    async createBoard(@Body() body: CreateBoardDto): Promise<Board> {
        return this.boardService.createBoard(body)
    }

    @Patch(':id')
    @ApiOperation({
        operationId: 'update_board',
        description: 'Update board fields by id',
    })
    @Policy({
        action: ActionEnum.update,
        subject: SubjectEnum.Board,
    })
    async updateBoard(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateBoardDto,
    ): Promise<Board> {
        return this.boardService.updateBoard(id, body)
    }

    @Delete(':id')
    @ApiOperation({
        operationId: 'delete_board',
        description: 'delete board by id',
    })
    @Policy({
        action: ActionEnum.delete,
        subject: SubjectEnum.Board,
    })
    async deleteBoard(@Param('id') id: number): Promise<void> {
        return this.boardService.deleteBoard(id)
    }
}
