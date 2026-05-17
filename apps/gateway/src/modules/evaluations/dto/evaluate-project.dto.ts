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
  IsNumber,
  IsNotEmpty,
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
      'Score value. Validated server-side against the evaluation type of the event. ' +
      'For FINAL_PROJECTS (default): integer 1–4 where 4 = Excelente (90), 3 = Bueno (75), ' +
      '2 = Aceptable (55), 1 = Insuficiente (25). The mapped value (0–100 scale) is stored and ' +
      'used for grade calculation.',
    example: 4,
  })
  @IsInt()
  @IsNumber()
  @IsNotEmpty()
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
