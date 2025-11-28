import { IsInt, IsPositive, IsOptional, IsString, IsArray, ArrayMinSize, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluateProjectDto {
  @IsInt()
  @IsPositive()
  projectId: number;

  @IsInt()
  @IsPositive()
  userId: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluationScoreDto)
  scores: EvaluationScoreDto[];
}

export class EvaluationScoreDto {
  @IsInt()
  @IsPositive()
  criterionId: number;

  @IsInt()
  @Min(1)
  @Max(4)
  score: number;
}
