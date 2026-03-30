import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@app/common/generated/event';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDTO {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Annual Tech Conference',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: 'A conference bringing together technology enthusiasts from around the world to discuss the latest trends in tech.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Access code required to join the event',
    example: 'TECH2024',
  })
  @IsString()
  @IsNotEmpty()
  accessCode: string;

  @ApiProperty({
    description: 'Indicates if the event is publicly joinable',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPubliclyJoinable: boolean = true;

  @ApiProperty({
    description: 'Deadline for event registration (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  inscriptionDeadline: string;

  @ApiProperty({
    description: 'Indicates if evaluations are opened for the event',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  evaluationsOpened: boolean = false;

  @ApiProperty({
    description: 'Start date of the event (ISO 8601 format)',
    example: '2024-01-01T09:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date of the event (ISO 8601 format)',
    example: '2024-01-03T17:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Location where the event will take place',
    example: 'Block K, 21K',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.EXPO,
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({
    description: 'Optional inscription cost for the event',
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inscriptionCost?: number;

  @ApiProperty({
    description: 'Additional location details',
    example: 'Building K, room 204',
    required: false,
  })
  @IsOptional()
  @IsString()
  locationDetails?: string;

  @ApiProperty({
    description: 'Collaborators associated with the event',
    example: ['Faculty of Engineering', 'Innovation Lab'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  collaborators: string[] = [];

  @ApiProperty({
    description: 'Organizers of the event',
    example: ['University Events Office'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  organizers: string[] = [];
}
 
