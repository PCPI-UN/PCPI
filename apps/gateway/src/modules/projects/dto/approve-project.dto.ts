import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ApproveProjectDto {
  @ApiProperty({
    description: 'Type of event the project is associated with (e.g., "Competition", "Exposition")',
    example: 'Competition',
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;
}
