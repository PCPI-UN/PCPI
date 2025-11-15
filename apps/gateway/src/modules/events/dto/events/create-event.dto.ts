import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty, IsDateString, MinLength, MaxLength } from 'class-validator';

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
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

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
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;
}
 