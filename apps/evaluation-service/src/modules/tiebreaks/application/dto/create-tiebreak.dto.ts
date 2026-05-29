import { IsInt, IsPositive } from 'class-validator';

export class CreateTieBreakDto {
    @IsInt()
    @IsPositive()
    projectId: number;

    @IsInt()
    @IsPositive()
    eventId: number;

    @IsInt()
    @IsPositive()
    categoryId: number;

    @IsInt()
    @IsPositive()
    tiebreakOrder: number;
}
