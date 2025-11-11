import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListCriterionsDto {
  @ApiProperty({
    description: 'Filter by event ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  eventId?: number;

  @ApiProperty({
    description: 'Filter by course ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseId?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
