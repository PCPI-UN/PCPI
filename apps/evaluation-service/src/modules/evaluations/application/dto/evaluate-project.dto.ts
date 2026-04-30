import { IsInt, IsPositive, IsOptional, IsString, IsArray, ArrayMinSize, ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
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
  @IsNumber()
  @IsNotEmpty()
  score: number;
}
