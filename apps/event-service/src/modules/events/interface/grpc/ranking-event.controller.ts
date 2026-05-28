import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EVENT_SERVICE_NAME } from '@app/common/generated/event';
import { RankingEventMapper } from '@events/application/mappers/ranking-event.mapper';
import { CreateRankingEventDTO } from '@events/application/dto/ranking-event/create-ranking-event.dto';
import { UpdateRankingEventDTO } from '@events/application/dto/ranking-event/update-ranking-event.dto';
import { GetRankingEventDTO } from '@events/application/dto/ranking-event/get-ranking-event.dto';
import { GetRankingEventByEventIdDTO } from '@events/application/dto/ranking-event/get-ranking-event-by-event-id.dto';
import { DeleteRankingEventDTO } from '@events/application/dto/ranking-event/delete-ranking-event.dto';
import { CreateRankingEventUseCase } from '@events/application/use-cases/ranking-event/create-ranking-event.use-case';
import { UpdateRankingEventUseCase } from '@events/application/use-cases/ranking-event/update-ranking-event.use-case';
import { GetRankingEventUseCase } from '@events/application/use-cases/ranking-event/get-ranking-event.use-case';
import { GetRankingEventByEventIdUseCase } from '@events/application/use-cases/ranking-event/get-ranking-event-by-event-id.use-case';
import { DeleteRankingEventUseCase } from '@events/application/use-cases/ranking-event/delete-ranking-event.use-case';

@Controller()
export class RankingEventController {
  constructor(
    private readonly createUC: CreateRankingEventUseCase,
    private readonly updateUC: UpdateRankingEventUseCase,
    private readonly getUC: GetRankingEventUseCase,
    private readonly getByEventIdUC: GetRankingEventByEventIdUseCase,
    private readonly deleteUC: DeleteRankingEventUseCase,
  ) {}

  @GrpcMethod(EVENT_SERVICE_NAME, 'CreateRankingEvent')
  async createRankingEvent(request: CreateRankingEventDTO) {
    const result = await this.createUC.execute(request);
    return RankingEventMapper.toResponse(result);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'UpdateRankingEvent')
  async updateRankingEvent(request: UpdateRankingEventDTO) {
    const result = await this.updateUC.execute(request);
    return RankingEventMapper.toResponse(result);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'GetRankingEvent')
  async getRankingEvent(request: GetRankingEventDTO) {
    const result = await this.getUC.execute(request);
    return RankingEventMapper.toResponse(result);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'GetRankingEventByEventId')
  async getRankingEventByEventId(request: GetRankingEventByEventIdDTO) {
    const result = await this.getByEventIdUC.execute(request);
    return RankingEventMapper.toResponse(result);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'DeleteRankingEvent')
  async deleteRankingEvent(request: DeleteRankingEventDTO) {
    await this.deleteUC.execute(request);
    return RankingEventMapper.toDeleteResponse();
  }
}
