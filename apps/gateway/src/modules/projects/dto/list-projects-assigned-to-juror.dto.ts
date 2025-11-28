import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';

export class ListProjectsAssignedToJurorDto {

  @ApiProperty({
    description: 'Event ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  eventId: number;

  @ApiPropertyOptional({
    description: 'Page Number',
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

}
