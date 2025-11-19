import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCoursesForDropdownDTO {
  @ApiProperty({
    description: 'ID of the event to get courses for',
    example: 1,
  })
  @IsInt() @IsPositive()
  @Type(() => Number)
  eventId: number;

  @ApiProperty({
    description: 'Filter to only include active courses',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean() @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean;
}
