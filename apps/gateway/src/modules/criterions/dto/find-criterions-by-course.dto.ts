import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FindCriterionsByCourseDto {
  @ApiProperty({
    description: 'Course ID to find criterions for',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  courseId: number;
}
