import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListCriterionsDto {
  @IsInt()
  @IsOptional()
  eventId?: number;

  @IsInt()
  @IsOptional()
  courseId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number = 10;
}