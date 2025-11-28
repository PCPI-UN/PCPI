import { IsInt, IsPositive } from 'class-validator';

export class GetTopProjectsByCourseDto {
    @IsInt()
    @IsPositive()
    courseId: number;
}
