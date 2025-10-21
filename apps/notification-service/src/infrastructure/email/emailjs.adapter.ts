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
    this.logger.log('Sending email...', { params });
    const { template, templateParams, to } = params;

    const templateId = this.configService.get<string>(
      `EMAILJS_TEMPLATE_${template.toUpperCase()}_ID`,
    );

    if (!templateId) {
      throw new Error(`Template ID for template "${template}" not found.`);
    }

    templateParams.to = to;
    try {
      const response = await emailjs.send(
        this.serviceId,
        templateId,
        templateParams,
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
