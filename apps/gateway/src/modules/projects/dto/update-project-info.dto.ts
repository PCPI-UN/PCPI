import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProjectInfoDto {
  @ApiPropertyOptional({
    description: 'The title of the project',
    type: String,
    example: 'New Project Name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'A brief description of the project',
    type: String,
    example: 'This project aims to...',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
