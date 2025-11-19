import { IsInt, IsOptional, IsBoolean, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCoursesByEventDTO {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  eventId: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
