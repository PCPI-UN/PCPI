import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExportProjectsExcelDto {
  @ApiProperty({
    description: 'Event ID to export projects from',
    example: 1,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  eventId: number;
}
