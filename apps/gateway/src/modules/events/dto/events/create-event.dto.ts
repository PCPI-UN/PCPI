import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsBoolean, IsPositive, IsOptional, IsString, IsNotEmpty, IsDateString} from 'class-validator';

export class CreateEventDTO {
  @ApiProperty({
    description: 'ID of the organization hosting the event',
    example: 10,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  organizationId?: number;

  @ApiProperty({
    description: 'Name of the event',
    example: 'Annual Tech Conference',
  })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: 'A conference bringing together technology enthusiasts from around the world to discuss the latest trends in tech.',
    required: false,
  })
  @IsString() @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Access code required to join the event',
    example: 'TECH2024',
  })
  @IsString() @IsNotEmpty()
  accessCode: string;

  @ApiProperty({
    description: 'Indicates if the event is publicly joinable',
    example: true,
  })
  @IsBoolean() @IsNotEmpty()
  isPubliclyJoinable: boolean;

  @ApiProperty({
    description: 'Deadline for event registration',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString() @IsNotEmpty()
  inscriptionDeadline: string; // ISO string

  @ApiProperty({
    description: 'Indicates if evaluations are opened for the event',
    example: false,
  })
  @IsBoolean() @IsNotEmpty()
  evaluationsOpened: boolean;

  @ApiProperty({
    description: 'Start date of the event',
    example: '2024-01-01T09:00:00Z',
  })
  @IsDateString() @IsNotEmpty()
  startDate: string;           // ISO string

  @ApiProperty({
    description: 'End date of the event',
    example: '2024-01-03T17:00:00Z',
  })
  @IsDateString() @IsNotEmpty()
  endDate: string;             // ISO string

  @ApiProperty({
    description: 'ID of the user creating the event',
    example: 5001,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  createdByUserId?: number; 

  @ApiProperty({
    description: 'ID of the user associated with the event',
    example: 5001,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  userId?: number;   

  @ApiProperty({
    description: 'Location where the event will take place',
    example: 'Block K, 21K',
    required: false,
  })
  @IsString() @IsOptional()
  location?: string;
  
}
 