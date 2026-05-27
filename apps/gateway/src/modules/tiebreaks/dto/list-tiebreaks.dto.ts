import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTieBreaksDto {
    @ApiProperty({ description: 'Filter by event ID', example: 1, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    eventId?: number;

    @ApiProperty({ description: 'Filter by award category ID', example: 1, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    categoryId?: number;

    @ApiProperty({ description: 'Filter by project ID', example: 1, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    projectId?: number;
}
