import { IsInt, IsNotEmpty } from 'class-validator';

export class FindEvaluationDto {
    @IsInt()
    @IsNotEmpty()
    id: number;
}
