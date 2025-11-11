import { IsInt, IsNotEmpty } from 'class-validator';

export class GetProjectStatsDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number;
}
