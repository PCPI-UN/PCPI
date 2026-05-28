import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTieBreakDto {
    @ApiProperty({ description: 'ID of the project being ranked', example: 1 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    projectId: number;

    @ApiProperty({ description: 'ID of the event', example: 1 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    eventId: number;

    @ApiProperty({ description: 'ID of the award category', example: 1 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    categoryId: number;

    @ApiProperty({ description: 'Tiebreak position order (must be greater than 0)', example: 1 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    tiebreakOrder: number;
}
