import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class GetUserInvitationsDto {
    @IsInt()
    @Min(1)
    userId: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @IsInt()
    @Min(1)
    @IsOptional()
    limit: number = 10;
}
