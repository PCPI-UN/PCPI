import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ApproveProjectDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  id: number;
}
