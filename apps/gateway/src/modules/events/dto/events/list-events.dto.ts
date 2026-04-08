import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EventStatus } from '@app/common/generated/event';

const normalizeStatuses = ({ value }: { value: unknown }): EventStatus[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;

  const values = Array.isArray(value) ? value : String(value).split(',');

  return values
    .map((entry) => Number(entry))
    .filter((entry) => !Number.isNaN(entry));
};

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

  @ApiProperty({
    description: 'Filter by multiple event statuses',
    example: [EventStatus.UPCOMING, EventStatus.AVAILABLE],
    enum: EventStatus,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @Transform(normalizeStatuses)
  @IsArray()
  @IsEnum(EventStatus, { each: true })
  statuses?: EventStatus[];
}
