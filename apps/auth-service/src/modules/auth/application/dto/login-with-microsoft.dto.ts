import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithMicrosoftDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}
