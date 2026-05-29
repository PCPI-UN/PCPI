import { TieBreakProto, ListTieBreaksResponse, DeleteTieBreakResponse } from '@app/common/generated/evaluation';
import { TieBreak } from '../../domain/entities/tiebreak.entity';

export class TieBreakMapper {
    static toProto(tiebreak: TieBreak): TieBreakProto {
        return {
            id: tiebreak.id,
            projectId: tiebreak.projectId,
            eventId: tiebreak.eventId,
            categoryId: tiebreak.categoryId,
            tiebreakOrder: tiebreak.tiebreakOrder,
            createdAt: tiebreak.createdAt.toISOString(),
            updatedAt: tiebreak.updatedAt.toISOString(),
        };
    }

    static toListResponse(tiebreaks: TieBreak[]): ListTieBreaksResponse {
        return {
            tiebreaks: tiebreaks.map(TieBreakMapper.toProto),
        };
    }

    static toDeleteResponse(success: boolean): DeleteTieBreakResponse {
        return {
            success,
            message: success ? 'TieBreak deleted successfully' : 'Failed to delete tiebreak',
        };
    }
}
