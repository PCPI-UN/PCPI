import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class GetCourseDTO {
  @ApiProperty({
    description: 'ID of the course to retrieve',
    example: 1,
  })
  @IsNumber() @IsNotEmpty() @IsPositive()
  id: number;
}