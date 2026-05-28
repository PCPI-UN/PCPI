import { IsInt, IsPositive } from 'class-validator';

export class DeleteTieBreakDto {
    @IsInt()
    @IsPositive()
    id: number;
}
