import { IsBoolean, IsInt, Min } from 'class-validator';

export class CreateRankingEventDTO {
  @IsInt()
  eventId: number;

  @IsInt()
  @Min(0)
  positions: number;

  @IsBoolean()
  visiblePublic: boolean = false;

  @IsBoolean()
  gradeVisible: boolean = false;
}
