import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import emailjs from '@emailjs/nodejs';
import { EmailTemplate } from '@app/common/generated/notification';
import {
  EmailServicePort,
  SendEmailParams,
} from '@/application/ports/email.service.port';

@Injectable()
export class EmailJsAdapter implements EmailServicePort, OnModuleInit {
  private readonly logger = new Logger(EmailJsAdapter.name);
  private serviceId: string | undefined;
  private PROJECT_SUBMITTED_TEMPLATE_ID: string | undefined;
  private PROJECT_APPROVED_TEMPLATE_ID: string | undefined;
  private PROJECT_REJECTED_TEMPLATE_ID: string | undefined;
  private JUROR_INVITATION_TEMPLATE_ID: string | undefined;
  private CHANGE_PASSWORD_TEMPLATE_ID: string | undefined;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {

    // Before everything else, we need to check if we have a service ID
    this.serviceId = this.configService.get<string>('EMAILJS_SERVICE_ID');

    if (!this.serviceId) {
      this.logger.error('EMAILJS_SERVICE_ID is not configured');
      throw new Error('EmailJS service ID configuration error');
    }

    // Now we need to check if all the template IDs are present
    this.PROJECT_SUBMITTED_TEMPLATE_ID = this.configService.get<string>('EMAILJS_TEMPLATE_PROJECT_SUBMITTED_ID');
    this.PROJECT_APPROVED_TEMPLATE_ID = this.configService.get<string>('EMAILJS_TEMPLATE_PROJECT_APPROVED_ID');
    this.PROJECT_REJECTED_TEMPLATE_ID = this.configService.get<string>('EMAILJS_TEMPLATE_PROJECT_REJECTED_ID');
    this.JUROR_INVITATION_TEMPLATE_ID = this.configService.get<string>('EMAILJS_TEMPLATE_JUROR_INVITATION_ID');
    this.CHANGE_PASSWORD_TEMPLATE_ID = this.configService.get<string>('EMAILJS_TEMPLATE_CHANGE_PASSWORD_ID');

    if (!this.PROJECT_SUBMITTED_TEMPLATE_ID ||
        !this.PROJECT_APPROVED_TEMPLATE_ID ||
        !this.PROJECT_REJECTED_TEMPLATE_ID ||
        !this.JUROR_INVITATION_TEMPLATE_ID ||
        !this.CHANGE_PASSWORD_TEMPLATE_ID) {
      this.logger.error('One or more EmailJS template IDs are not configured properly');
      throw new Error('EmailJS template IDs configuration error');
    }

    this.logger.log('Initializing EmailJS...');
    emailjs.init({
      publicKey: this.configService.get<string>('EMAILJS_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('EMAILJS_PRIVATE_KEY'),
    });
  }

  async sendEmail(templateParams: SendEmailParams): Promise<{ success: boolean }> {
    this.logger.log('Sending email...', { to: templateParams.to, template: templateParams.template });
    const { to, template, params } = templateParams;

    let templateId: string;
    switch (template) {
      case EmailTemplate.PROJECT_SUBMITTED:
        templateId = this.PROJECT_SUBMITTED_TEMPLATE_ID!;
        break;
      case EmailTemplate.PROJECT_APPROVED:
        templateId = this.PROJECT_APPROVED_TEMPLATE_ID!;
        break;
      case EmailTemplate.PROJECT_REJECTED:
        templateId = this.PROJECT_REJECTED_TEMPLATE_ID!;
        break;
      case EmailTemplate.JUROR_INVITATION:
        templateId = this.JUROR_INVITATION_TEMPLATE_ID!;
        break;
      case EmailTemplate.CHANGE_PASSWORD:
        templateId = this.CHANGE_PASSWORD_TEMPLATE_ID!;
        break;
      default:
        throw new Error(`Unsupported email template: ${template}`);
    }

    try {
      const response = await emailjs.send(
        this.serviceId!,
        templateId,
        {
          to,
          ...params,
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
