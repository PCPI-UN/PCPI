import { IsInt, Min } from 'class-validator';

export class GetCourseDTO {
  @IsInt()
  @Min(1)
  id: number;
}
