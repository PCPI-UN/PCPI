import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListProjectsForReviewDto {
  @ApiProperty({ description: 'ID del evento' })
  @Type(() => Number)
  @IsInt()
  eventId: number;

  @ApiPropertyOptional({ description: 'ID del curso' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  courseId?: number;

  @ApiPropertyOptional({ description: 'Texto de búsqueda' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Página actual', default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  currentPage?: number;

  @ApiPropertyOptional({ description: 'Items por página', default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  itemsPerPage?: number;
}