import { IsInt, IsPositive, isArray, IsNotEmpty } from "class-validator";

export class FindByCourseDto {
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    courseId: number;
}