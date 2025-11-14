import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsPositive, IsOptional, IsString, IsNotEmpty, IsDateString} from 'class-validator';


export class UpdateEventDTO {
  @ApiProperty({
    description: 'ID of the event to update',
    example: 123,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'New name of the event',
    example: 'Annual Science Fair',
    required: false,
  })
  @IsString() @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'New description of the event',
    example: 'An event showcasing scientific projects from students.',
    required: false,
  })
  @IsString() @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'New access code for the event',
    example: 'SCI2024',
    required: false,
  })
  @IsString() @IsOptional()
  accessCode?: string;   

  @ApiProperty({
    description: 'Indicates if the event is publicly joinable',
    example: true,
    required: false,
  })
  @IsBoolean() @IsOptional()
  isPubliclyJoinable?: boolean;

  @ApiProperty({
    description: 'New deadline for event registration',
    example: '2024-11-30T23:59:59Z',
    required: false,
  })
  @IsDateString() @IsOptional()
  inscriptionDeadline?: string;

  @ApiProperty({
    description: 'Indicates if evaluations are opened for the event',
    example: false, 
    required: false,
  })
  @IsBoolean() @IsOptional()
  evaluationsOpened?: boolean;

  @ApiProperty({
    description: 'New start date of the event',
    example: '2024-05-01T09:00:00Z',
    required: false,
  })
  @IsDateString() @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'New end date of the event',
    example: '2024-05-03T17:00:00Z',
    required: false,
  })
  @IsDateString() @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Indicates if the event is active',
    example: true,
    required: false,
  })
  @IsBoolean() @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'New location of the event',
    example: 'Main Auditorium',
    required: false,
  })
  @IsString() @IsOptional()
  location?: string;
}

