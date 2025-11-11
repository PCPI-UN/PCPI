import { IsInt, IsNotEmpty, IsOptional, IsPositive, Min, Max } from 'class-validator';

export class FindEvaluationsByEvaluatorDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}