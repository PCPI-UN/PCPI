import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateRankingEventDTO {
  @IsInt()
  eventId: number;

  @IsInt()
  @Min(0)
  positions: number;

  @IsOptional()
  @IsBoolean()
  visiblePublic?: boolean;

  @IsOptional()
  @IsBoolean()
  gradeVisible?: boolean;
}
