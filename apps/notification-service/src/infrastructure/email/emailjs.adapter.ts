import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import emailjs from '@emailjs/nodejs';
import {
  EmailServicePort,
  SendEmailParams,
} from '@/application/ports/email.service.port';

@Injectable()
export class EmailJsAdapter implements EmailServicePort, OnModuleInit {
  private readonly serviceId: string = 'default_service';
  private readonly logger = new Logger(EmailJsAdapter.name);
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.logger.log('Initializing EmailJS...');
    emailjs.init({
      publicKey: this.configService.get<string>('EMAIL_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('EMAIL_PRIVATE_KEY'),
    });
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean }> {
    this.logger.log('Sending email...', { to: params.to, subject: params.subject });
    const { to, subject, body } = params;

    // Use a generic template ID from config
    const templateId = this.configService.get<string>('EMAIL_TEMPLATE_ID');

    if (!templateId) {
      throw new Error('EmailJS template ID not configured');
    }

    try {
      const response = await emailjs.send(
        this.serviceId,
        templateId,
        {
          to,
          subject,
          body,
        },
      );

      if (response.status !== 200) {
        throw new Error(response.text);
      }
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return { success: false };
    }
  }
}
