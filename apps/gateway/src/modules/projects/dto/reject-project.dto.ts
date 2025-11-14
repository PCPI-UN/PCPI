import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectProjectDto {
  @ApiProperty({
    description: 'Project ID to reject',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  id: number;

  @ApiProperty({
    description: 'Reason for rejecting the project',
    example: 'Project does not meet the minimum requirements for innovation and technical complexity.',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
