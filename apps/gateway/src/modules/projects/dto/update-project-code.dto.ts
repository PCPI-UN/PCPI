import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProjectCodeDto {
  @ApiProperty({
    description: 'The new project code',
    type: String,
    example: 'PROJ-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  projectCode!: string;
}
