import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEventsDropdownDTO {
  @ApiProperty({
    example: 1,
    required: false,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    example: 100,
    required: false,
    default: 100,
    description: 'Number of items per page for pagination',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 100;

  @ApiProperty({
    example: true,
    required: false,
    default: true,
    description: 'Whether to include only active events',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean = true;
}
