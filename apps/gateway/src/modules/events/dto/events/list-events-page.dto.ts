import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class ListEventsPageDTO {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsNumber() @Min(1) @IsNotEmpty()
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination (max 100)',
    example: 20,
  })
  @IsNumber() @Min(1) @Max(100) @IsNotEmpty()
  limit: number = 20;

  @ApiProperty({
    description: 'Search query to filter events by name or description',
    example: 'Annual Meeting',
    required: false,
  })
  @IsOptional() @IsString()
  q?: string;

  @ApiProperty({
    description: 'Filter to show only active events',
    example: true,
    required: false,
  })
  @IsOptional() @IsBoolean()
  onlyActive?: boolean;
}
