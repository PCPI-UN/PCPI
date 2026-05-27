import { IsInt, IsPositive } from 'class-validator';

export class GetTieBreakDto {
    @IsInt()
    @IsPositive()
    id: number;
}
