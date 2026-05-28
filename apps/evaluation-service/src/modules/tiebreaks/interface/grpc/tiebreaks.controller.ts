import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
    TIE_BREAK_SERVICE_NAME,
    TieBreakProto,
    ListTieBreaksResponse,
    DeleteTieBreakResponse,
} from '@app/common/generated/evaluation';
import { CreateTieBreakUseCase } from '../../application/use-cases/create-tiebreak.use-case';
import { GetTieBreakUseCase } from '../../application/use-cases/get-tiebreak.use-case';
import { ListTieBreaksUseCase } from '../../application/use-cases/list-tiebreaks.use-case';
import { UpdateTieBreakUseCase } from '../../application/use-cases/update-tiebreak.use-case';
import { DeleteTieBreakUseCase } from '../../application/use-cases/delete-tiebreak.use-case';
import { CreateTieBreakDto } from '../../application/dto/create-tiebreak.dto';
import { GetTieBreakDto } from '../../application/dto/get-tiebreak.dto';
import { ListTieBreaksDto } from '../../application/dto/list-tiebreaks.dto';
import { UpdateTieBreakDto } from '../../application/dto/update-tiebreak.dto';
import { DeleteTieBreakDto } from '../../application/dto/delete-tiebreak.dto';
import { TieBreakMapper } from '../../application/mappers/tiebreak.mapper';

@Controller()
export class TieBreaksController {
    constructor(
        private readonly createTieBreakUseCase: CreateTieBreakUseCase,
        private readonly getTieBreakUseCase: GetTieBreakUseCase,
        private readonly listTieBreaksUseCase: ListTieBreaksUseCase,
        private readonly updateTieBreakUseCase: UpdateTieBreakUseCase,
        private readonly deleteTieBreakUseCase: DeleteTieBreakUseCase,
    ) {}

    @GrpcMethod(TIE_BREAK_SERVICE_NAME, 'CreateTieBreak')
    async createTieBreak(request: CreateTieBreakDto): Promise<TieBreakProto> {
        const tiebreak = await this.createTieBreakUseCase.execute(request);
        return TieBreakMapper.toProto(tiebreak);
    }

    @GrpcMethod(TIE_BREAK_SERVICE_NAME, 'GetTieBreak')
    async getTieBreak(request: GetTieBreakDto): Promise<TieBreakProto> {
        const tiebreak = await this.getTieBreakUseCase.execute(request);
        return TieBreakMapper.toProto(tiebreak);
    }

    @GrpcMethod(TIE_BREAK_SERVICE_NAME, 'ListTieBreaks')
    async listTieBreaks(request: ListTieBreaksDto): Promise<ListTieBreaksResponse> {
        const tiebreaks = await this.listTieBreaksUseCase.execute(request);
        return TieBreakMapper.toListResponse(tiebreaks);
    }

    @GrpcMethod(TIE_BREAK_SERVICE_NAME, 'UpdateTieBreak')
    async updateTieBreak(request: UpdateTieBreakDto): Promise<TieBreakProto> {
        const tiebreak = await this.updateTieBreakUseCase.execute(request);
        return TieBreakMapper.toProto(tiebreak);
    }

    @GrpcMethod(TIE_BREAK_SERVICE_NAME, 'DeleteTieBreak')
    async deleteTieBreak(request: DeleteTieBreakDto): Promise<DeleteTieBreakResponse> {
        await this.deleteTieBreakUseCase.execute(request);
        return TieBreakMapper.toDeleteResponse(true);
    }
}
