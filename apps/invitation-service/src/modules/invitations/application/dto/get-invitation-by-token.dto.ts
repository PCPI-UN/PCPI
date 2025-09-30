import { IsNotEmpty, IsString } from 'class-validator';

export class GetInvitationByTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}