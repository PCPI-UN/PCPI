import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTieBreakDto {
    @ApiProperty({ description: 'New tiebreak position order (must be greater than 0)', example: 2, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    tiebreakOrder?: number;

    @ApiProperty({ description: 'New project ID', example: 2, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    projectId?: number;

    @ApiProperty({ description: 'New category ID', example: 2, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    categoryId?: number;
}
