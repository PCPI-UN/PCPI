import { IsInt } from 'class-validator';

export class DeleteRankingEventDTO {
  @IsInt()
  id: number;
}
