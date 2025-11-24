import { IsNotEmpty, IsString } from 'class-validator';

export class ResendInvitationDto {
    @IsString()
    @IsNotEmpty()
    invitationId: string;
}
