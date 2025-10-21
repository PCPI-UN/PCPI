import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsInt()
  @Min(1)
  invitedUserId: number;
}