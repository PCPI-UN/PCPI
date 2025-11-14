import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class DeleteCourseDTO {
  @ApiProperty({
    description: 'ID of the course to delete',
    example: 1,
  })
  @IsInt() @IsNotEmpty() @IsPositive()
  id: number;
}