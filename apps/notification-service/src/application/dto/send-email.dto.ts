import { SendEmailRequest } from '@app/common/generated/notification';
import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendEmailDto implements SendEmailRequest {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  context: { [key: string]: string };
}
