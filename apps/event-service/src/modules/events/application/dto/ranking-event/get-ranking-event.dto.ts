import { IsInt } from 'class-validator';

export class GetRankingEventDTO {
  @IsInt()
  id: number;
}
