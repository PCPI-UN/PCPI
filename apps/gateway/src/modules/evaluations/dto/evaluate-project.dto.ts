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
      'Score value. Valid range depends on the evaluation type configured for the event and is validated server-side.',
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
