import { IsNotEmpty, IsString } from 'class-validator';

export class RejectInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}