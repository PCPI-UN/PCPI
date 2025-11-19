import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsPositive, IsString, Min} from 'class-validator';
import { Type } from 'class-transformer';

export class ListCoursesDTO {
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
    default: 1,
  })
  @IsInt() @IsOptional() @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 10,
    required: false,
    default: 10,
  })
  @IsInt() @IsOptional() @Min(1)
  @Type(() => Number)
  limit?: number = 10;
  
  @ApiProperty({
    description: 'Search query to filter courses by code or description',
    example: 'CS101',
    required: false,
  })
  @IsString() @IsOptional()
  @Type(() => String)
  q?: string;        // code/description search

  @ApiProperty({
    description: 'Token for pagination',
    example: 'abc123token',
    required: false,
  })
  @IsString() @IsOptional()
  @Type(() => String)
  pageToken?: string;   // optional if you later implement tokens
}
