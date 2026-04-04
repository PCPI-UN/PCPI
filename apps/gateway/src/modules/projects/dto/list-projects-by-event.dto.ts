import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum, IsPositive } from 'class-validator';

export enum ProjectStateFilter {
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUEST_CHANGES = 'REQUEST_CHANGES'
}

export class ListProjectsByEventDto {

  @ApiPropertyOptional({
    description: 'Filter by course id',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Filter by project state',
    enum: ProjectStateFilter,
    example: ProjectStateFilter.UNDER_REVIEW,
  })
  @IsOptional()
  @IsEnum(ProjectStateFilter)
  state?: ProjectStateFilter;

  @ApiPropertyOptional({
    description: 'Text search in project name',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  currentPage?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemsPerPage?: number;

}