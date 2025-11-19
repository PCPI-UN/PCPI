import { IsInt, Min } from 'class-validator';

export class DeleteCourseDTO {
  @IsInt()
  @Min(1)
  id: number;
}
