import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class DeleteCourseDTO {
  @ApiProperty({
    description: 'ID of the course to delete',
    example: 1,
  })
  @IsNumber() @IsNotEmpty() @IsPositive()
  id: number;
}