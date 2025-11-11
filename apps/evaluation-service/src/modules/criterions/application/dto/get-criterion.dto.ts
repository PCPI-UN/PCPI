import { IsInt, IsPositive } from 'class-validator';

export class GetCriterionDto {
  @IsInt()
  @IsPositive()
  id: number;
}