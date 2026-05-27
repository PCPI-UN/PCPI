import { IsInt } from 'class-validator';

export class GetRankingEventByEventIdDTO {
  @IsInt()
  eventId: number;
}
