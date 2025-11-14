import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCourseDTO {
  @ApiProperty({
    description: 'ID of the course to retrieve',
    example: 1,
  })
  @IsInt() @IsNotEmpty() @IsPositive()
  @Type(() => Number)
  id: number;
}