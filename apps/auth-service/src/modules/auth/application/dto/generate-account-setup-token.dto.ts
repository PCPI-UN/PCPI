import { IsInt, Min } from 'class-validator';

export class GenerateAccountSetupTokenDto {
  @IsInt()
  @Min(1)
  userId: number;
}
