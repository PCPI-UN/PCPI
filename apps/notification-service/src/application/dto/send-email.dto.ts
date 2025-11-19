import { SendEmailRequest, EmailTemplate } from '@app/common/generated/notification';
import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendEmailDto implements SendEmailRequest {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsEnum(EmailTemplate)
  @IsNotEmpty()
  template: EmailTemplate;

  @IsObject()
  params: Record<string, any>;
}