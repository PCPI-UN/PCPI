import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateComponentDto {
  @ApiProperty({
    description: 'Name of the component',
    example: 'Design Quality',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Weight of the component (0 to 1)',
    example: 0.4,
    minimum: 0,
    maximum: 1,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  @Type(() => Number)
  weight?: number;
}
