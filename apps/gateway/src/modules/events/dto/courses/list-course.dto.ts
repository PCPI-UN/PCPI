import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ListCoursesDTO {
  @ApiProperty({
    description: 'ID of the event to filter courses',
    example: 1,
    required: false,
  })
  @IsNumber() @IsOptional() @IsPositive()
  eventId?: number;

  @ApiProperty({
    description: 'Filter to only include active courses',
    example: true,
    required: false,
  })
  @IsBoolean() @IsOptional()
  onlyActive?: boolean;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsNumber() @IsOptional() @IsPositive()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 10,
    required: false,
  })
  @IsNumber() @IsOptional() @IsPositive()
  pageSize?: number;
  
  @ApiProperty({
    description: 'Search query to filter courses by code or description',
    example: 'CS101',
    required: false,
  })
  @IsString() @IsOptional()
  q?: string;        // code/description search

  @ApiProperty({
    description: 'Token for pagination',
    example: 'abc123token',
    required: false,
  })
  @IsString() @IsOptional()
  pageToken?: string;   // optional if you later implement tokens
}
