import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class ListCoursesByEventDTO {
  @ApiProperty({
    description: 'ID of the event to filter courses',
    example: 1,
  })
  @IsNumber() @IsPositive()
  eventId: number;      // required

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
    example: 20,
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
  q?: string;
}
