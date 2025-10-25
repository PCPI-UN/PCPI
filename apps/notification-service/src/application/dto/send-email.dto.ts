import { SendEmailRequest } from '@app/common/generated/notification';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailDto implements SendEmailRequest {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
