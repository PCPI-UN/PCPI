import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateEventDTO {
  @ApiProperty({
    description: 'ID of the event to update',
    example: 123,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'New name of the event',
    example: 'Annual Science Fair',
    required: false,
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'New description of the event',
    example: 'An event showcasing scientific projects from students.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'New access code for the event',
    example: 'SCI2024',
    required: false,
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'accessCode must contain only alphanumeric characters and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  accessCode?: string;

  @ApiProperty({
    description: 'Indicates if the event is publicly joinable',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPubliclyJoinable?: boolean;

  @ApiProperty({
    description: 'New deadline for event registration (ISO 8601 format)',
    example: '2024-11-30T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  inscriptionDeadline?: string;

  @ApiProperty({
    description: 'Indicates if evaluations are opened for the event',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  evaluationsOpened?: boolean;

  @ApiProperty({
    description: 'New start date of the event (ISO 8601 format)',
    example: '2024-05-01T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'New end date of the event (ISO 8601 format)',
    example: '2024-05-03T17:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Indicates if the event is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'New location of the event',
    example: 'Main Auditorium',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}

