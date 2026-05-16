import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectProjectDto {
  @ApiProperty({
    description: 'Reason for rejecting the project',
    example: 'Project does not meet the minimum requirements for innovation and technical complexity.',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Type of event the project is associated with (e.g., "Competition", "Exposition")',
    example: 'Competition',
  })
  @IsString()
  eventType: string;
}
