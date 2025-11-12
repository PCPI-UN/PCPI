import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateCourseDTO {
  @ApiProperty({
    description: 'ID of the event the course belongs to',
    example: 1,
  })
  @IsNumber() @IsNotEmpty() @IsPositive()
  eventId: number;

  @ApiProperty({
    description: 'Unique code for the course within the event',
    example: 'CS101',
  })
  @IsString() @IsNotEmpty()
  code: string;             // Unique code for the course within the event

  @ApiProperty({
    description: 'Name of the course',
    example: 'Introduction to Computer Science',
  })
  @IsString() @IsNotEmpty()
  name: string;           // Course name

  @ApiProperty({
    description: 'Detailed description of the course',
    example: 'This course covers the basics of computer science, including algorithms, data structures, and programming principles.',
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
  active?: boolean;         // true by default in DB
}
