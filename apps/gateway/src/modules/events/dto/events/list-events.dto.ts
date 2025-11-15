import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsPositive, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '@app/common/generated/event';

export class ListEventsDTO {
  @ApiProperty({
    description: 'Search query to filter events by name or description',
    example: 'conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  q?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter to show only active events',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean = true;

  @ApiProperty({
    description: 'Filter by event status',
    example: EventStatus.UPCOMING,
    enum: EventStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  @Type(() => Number)
  status?: EventStatus;
}
