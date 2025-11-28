import { IsArray, IsInt, IsPositive, ArrayMinSize } from 'class-validator';

export class GetTopProjectsByCourseDto {
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    @ArrayMinSize(1)
    projectIds: number[];
}
