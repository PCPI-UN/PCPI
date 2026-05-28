import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateTieBreakDto {
    @IsInt()
    @IsPositive()
    id: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    tiebreakOrder?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    projectId?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    categoryId?: number;
}
