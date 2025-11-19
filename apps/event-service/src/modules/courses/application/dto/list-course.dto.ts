import { IsInt, IsOptional, IsString, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCoursesDTO {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  eventId?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  @Type(() => String)
  q?: string;
}
