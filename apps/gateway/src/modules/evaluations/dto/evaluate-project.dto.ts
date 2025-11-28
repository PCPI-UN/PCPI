import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';

export class EvaluationScoreDto {
  @ApiProperty({
    description: 'Criterion ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  criterionId: number;

  @ApiProperty({
    description:
      'Score value: 4 = Excelente, 3 = Bueno, 2 = Aceptable, 1 = Insuficiente',
    example: 4,
    minimum: 1,
    maximum: 4,
  })
  @IsInt()
  @Min(1)
  @Max(4)
  score: number;
}

export class EvaluateProjectDto {
  @ApiProperty({
    description: 'Project ID to evaluate',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  projectId: number;

  @ApiProperty({
    description: 'Optional comments about the evaluation',
    example: 'Great project with solid implementation',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({
    description: 'Array of scores for each criterion',
    type: [EvaluationScoreDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluationScoreDto)
  scores: EvaluationScoreDto[];
}
