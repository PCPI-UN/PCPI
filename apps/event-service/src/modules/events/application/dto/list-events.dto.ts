import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MinLength,
  IsEnum,
  IsArray,
} from 'class-validator';
import { EventStatus } from '@app/common/generated/event';

export class ListEventsDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @IsOptional()
  @IsBoolean()
  onlyActive?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(EventStatus, { each: true })
  statuses?: EventStatus[];
}
