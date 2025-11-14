import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEventsPageDTO {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsInt() @Min(1) @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page for pagination (max 100)',
    example: 20,
    required: false,
  })
  @IsInt() @Min(1) @Max(20) @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Filter to show only active events',
    example: true,
    required: false,
  })
  @IsOptional() @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @ApiProperty({
    description: 'Search query to filter events by name or description',
    example: 'Annual Meeting',
    required: false,
  })
  @IsOptional() @IsString()
  @Type(() => String)
  q?: string;

}
