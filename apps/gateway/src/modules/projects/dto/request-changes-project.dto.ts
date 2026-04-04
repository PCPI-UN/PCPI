import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestChangesProjectDto {
  @ApiProperty({
    description: 'Reason for request changes',
    example: 'The documents and links in the projects are not working',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason: string;
}
