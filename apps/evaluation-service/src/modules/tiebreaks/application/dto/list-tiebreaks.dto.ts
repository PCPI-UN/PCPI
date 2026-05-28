import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class ListTieBreaksDto {
    @IsInt()
    @IsPositive()
    @IsOptional()
    eventId?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    categoryId?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    projectId?: number;
}
