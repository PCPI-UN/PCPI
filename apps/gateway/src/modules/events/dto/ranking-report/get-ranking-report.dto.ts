import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { ProjectStateFilter } from '../../../projects/dto/list-projects-by-event.dto';

/**
 * Supported output formats for ranking report generation.
 * - json: API payload for UI and integrations.
 * - excel: downloadable XLSX document.
 */
export enum RankingReportFormat {
  JSON = 'json',
  EXCEL = 'excel',
}

/**
 * Query contract used by admin and public ranking report endpoints.
 *
 * Notes:
 * - categoryId is optional and narrows the report to a single category.
 * - category_id is accepted as an alias for backward compatibility.
 * - state filters projects before the ranking is computed.
 * - format defaults to JSON when omitted.
 */
export class GetRankingReportDto {
  @ApiPropertyOptional({
    description: 'Filter ranking by category (course/degree) id',
    example: 3,
  })
  @IsOptional()
  @Transform(({ value, obj }) => value ?? obj?.category_id)
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Filter projects by state before generating the ranking',
    enum: ProjectStateFilter,
    example: ProjectStateFilter.APPROVED,
  })
  @IsOptional()
  @IsEnum(ProjectStateFilter)
  state?: ProjectStateFilter;

  @ApiPropertyOptional({
    description: 'Output format for ranking report',
    enum: RankingReportFormat,
    example: RankingReportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(RankingReportFormat)
  format?: RankingReportFormat = RankingReportFormat.JSON;
}