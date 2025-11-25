import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class ActivateUserWithMicrosoftDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    token: string;
}
