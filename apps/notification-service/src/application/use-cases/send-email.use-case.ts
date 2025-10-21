import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from '../dto/send-email.dto';
import { SendEmailResponse } from '@app/common/generated/notification';
import { EmailServicePort } from '@/application/ports/email.service.port';

@Injectable()
export class SendEmailUseCase {
  private readonly logger = new Logger(SendEmailUseCase.name);

  constructor(private readonly emailService: EmailServicePort) {}

  async execute(sendEmailDto: SendEmailDto): Promise<SendEmailResponse> {
    this.logger.log('Attempting to send email...', {
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
    });

    const result = await this.emailService.sendEmail({
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      body: sendEmailDto.body,
    });

    if (!result.success) {
      this.logger.error('Failed to send email', { to: sendEmailDto.to });
    } else {
      this.logger.log('Email sent successfully', { to: sendEmailDto.to });
    }

    return result;
  }
}
