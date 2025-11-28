import { IsInt, IsNotEmpty, IsArray, ArrayMinSize, IsPositive } from 'class-validator';

export class CheckEvaluationStatusDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  eventId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  projectIds: number[];
}
