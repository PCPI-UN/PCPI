import { IsString, IsNotEmpty } from 'class-validator';
export class ValidateTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
