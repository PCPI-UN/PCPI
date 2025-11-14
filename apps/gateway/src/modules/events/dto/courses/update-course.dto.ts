import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateCourseDTO {
  @ApiProperty({
    description: 'ID of the course to update',
    example: 1,
  })
  @IsInt() @IsNotEmpty() @IsPositive()
  id: number;           
  
  @ApiProperty({
    description: 'New code for the course',
    example: 'CS101',
    required: false,
  })
  @IsString() @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'New description for the course',
    example: 'Introduction to Computer Science',
    required: false,
  })
  @IsString() @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indicates if the course is active',
    example: true,
    required: false,
  })
  @IsBoolean() @IsOptional()
  active?: boolean;
}
