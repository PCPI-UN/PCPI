import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsPositive, IsOptional, IsString} from 'class-validator';
import { Type } from 'class-transformer';

export class ListEventsDTO {
  @ApiProperty({
    description: 'Search query to filter events by name or description',
    example: 'conference',
    required: false,
  })
  @IsOptional() @IsString()
  @Type(() => String)
  q?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsInt() @IsPositive() @IsOptional()
  @Type(() => Number)
  page?: number;     // default 1

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 20,
    required: false,
  })
  @IsInt() @IsPositive() @IsOptional()
  @Type(() => Number)
  pageSize?: number; // default 20

  @ApiProperty({
    description: 'Filter to show only active events',
    example: true,
    required: false,
  })
  @IsOptional() @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;
}
