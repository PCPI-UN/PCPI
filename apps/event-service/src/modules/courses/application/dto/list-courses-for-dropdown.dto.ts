import { IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCoursesForDropdownDTO {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  eventId: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean;
}
