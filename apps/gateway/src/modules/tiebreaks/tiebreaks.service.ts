import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    TIE_BREAK_SERVICE_NAME,
    TieBreakServiceClient,
    TieBreakProto,
    ListTieBreaksResponse,
    DeleteTieBreakResponse,
} from '@app/common/generated/evaluation';
import { CreateTieBreakDto } from './dto/create-tiebreak.dto';
import { UpdateTieBreakDto } from './dto/update-tiebreak.dto';
import { ListTieBreaksDto } from './dto/list-tiebreaks.dto';

@Injectable()
export class TieBreaksService implements OnModuleInit {
    private tieBreakService: TieBreakServiceClient;

    constructor(
        @Inject(TIE_BREAK_SERVICE_NAME) private readonly client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.tieBreakService =
            this.client.getService<TieBreakServiceClient>(TIE_BREAK_SERVICE_NAME);
    }

    async createTieBreak(dto: CreateTieBreakDto): Promise<TieBreakProto> {
        return firstValueFrom(this.tieBreakService.createTieBreak(dto));
    }

    async getTieBreak(id: number): Promise<TieBreakProto> {
        return firstValueFrom(this.tieBreakService.getTieBreak({ id }));
    }

    async listTieBreaks(dto: ListTieBreaksDto): Promise<ListTieBreaksResponse> {
        return firstValueFrom(this.tieBreakService.listTieBreaks(dto));
    }

    async updateTieBreak(id: number, dto: UpdateTieBreakDto): Promise<TieBreakProto> {
        return firstValueFrom(this.tieBreakService.updateTieBreak({ id, ...dto }));
    }

    async deleteTieBreak(id: number): Promise<DeleteTieBreakResponse> {
        return firstValueFrom(this.tieBreakService.deleteTieBreak({ id }));
    }
}
