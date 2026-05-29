export interface RankingEvent {
  id: number;
  eventId: number;
  visiblePublic: boolean;
  positions: number;
  gradeVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
