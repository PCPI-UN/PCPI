import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsPositive, IsOptional, IsString} from 'class-validator';


export class ListEventsDTO {
  @ApiProperty({
    description: 'Search query to filter events by name or description',
    example: 'conference',
    required: false,
  })
  @IsOptional() @IsString()
  q?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  page?: number;     // default 1

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 20,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  pageSize?: number; // default 20

  @ApiProperty({
    description: 'Filter to show only active events',
    example: true,
    required: false,
  })
  @IsOptional() @IsBoolean()
  onlyActive?: boolean;
}
