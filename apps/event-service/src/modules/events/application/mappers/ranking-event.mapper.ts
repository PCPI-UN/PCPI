import { DeleteRankingEventResponse, RankingEventProto, RankingEventResponse } from '@app/common/generated/event';
import { RankingEvent } from '@events/domain/entities/ranking-event.entity';

export class RankingEventMapper {
  static toProto(rankingEvent: RankingEvent): RankingEventProto {
    return {
      id: rankingEvent.id,
      eventId: rankingEvent.eventId,
      visiblePublic: rankingEvent.visiblePublic,
      positions: rankingEvent.positions,
      gradeVisible: rankingEvent.gradeVisible,
      createdAt: rankingEvent.createdAt.toISOString(),
      updatedAt: rankingEvent.updatedAt.toISOString(),
    };
  }

  static toResponse(rankingEvent: RankingEvent): RankingEventResponse {
    return { rankingEvent: this.toProto(rankingEvent) };
  }

  static toDeleteResponse(): DeleteRankingEventResponse {
    return { ok: true };
  }
}
