import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListCoursesByEventDTO {
  @ApiProperty({
    description: 'ID of the event to filter courses',
    example: 1,
    required: false,
  })
  @IsInt() @IsOptional() @IsPositive()
  @Type(() => Number)
  eventId?: number;

  @ApiProperty({
    description: 'Filter to only include active courses',
    example: true,
    required: false,
  })
  @IsBoolean() @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean;
  
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsInt() @IsOptional() @IsPositive()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 20,
    required: false,
  })
  @IsInt() @IsOptional() @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Search query to filter courses by code or description',
    example: 'CS101',
    required: false,
  })
  @IsString() @IsOptional()
  @Type(() => String)
  q?: string;
}
