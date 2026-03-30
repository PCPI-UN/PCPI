import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsISO8601,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  Min,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { EventType } from '@app/common/generated/event';

export class CreateEventDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'accessCode must contain only alphanumeric characters and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  accessCode: string;

  @IsBoolean()
  isPubliclyJoinable: boolean = false;

  @IsISO8601()
  inscriptionDeadline: string;

  @IsBoolean()
  evaluationsOpened: boolean = false;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inscriptionCost?: number;

  @IsOptional()
  @IsString()
  locationDetails?: string;

  @IsArray()
  @IsString({ each: true })
  collaborators: string[] = [];

  @IsArray()
  @IsString({ each: true })
  organizers: string[] = [];

  @IsOptional()
  @IsInt()
  @Min(1)
  createdByUserId?: number;
}
