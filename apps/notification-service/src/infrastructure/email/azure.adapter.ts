import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
const matter = require('gray-matter');
import * as handlebars from 'handlebars';
import { EmailTemplate } from '@app/common/generated/notification';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import emailjs from '@emailjs/nodejs';

import {
  EmailServicePort,
  SendEmailParams,
} from '@/application/ports/email.service.port';

@Injectable()
export class AzureAdapter implements EmailServicePort, OnModuleInit {
  private readonly logger = new Logger(AzureAdapter.name);

  private azureClient: EmailClient | null = null;
  private azureSenderAddress: string | undefined;

  private emailJsServiceId: string | undefined;
  private emailJsTemplateId: string | undefined;
  private emailJsPublicKey: string | undefined;
  private emailJsPrivateKey: string | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.emailJsServiceId = this.configService.get<string>('EMAILJS_SERVICE_ID');
    this.emailJsTemplateId = this.configService.get<string>('EMAILJS_TEMPLATE_ID');
    this.emailJsPublicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
    this.emailJsPrivateKey = this.configService.get<string>('EMAILJS_PRIVATE_KEY');

    if (
      !this.emailJsServiceId ||
      !this.emailJsTemplateId ||
      !this.emailJsPublicKey ||
      !this.emailJsPrivateKey
    ) {
      this.logger.error('EmailJS configuration is incomplete');
      throw new Error('EmailJS configuration error');
    }

    const azureConnectionString = this.configService.get<string>('ACS_CONNECTION_STRING');
    this.azureSenderAddress = this.configService.get<string>('ACS_SENDER_ADDRESS');

    if (azureConnectionString && this.azureSenderAddress) {
      this.azureClient = new EmailClient(azureConnectionString);
      this.logger.log('Azure ACS configured as email fallback provider');
    } else {
      this.logger.warn('Azure ACS not configured — no email fallback available');
    }
  }

  private resolveTemplatePath(template: EmailTemplate): string {
    const base = 'dist/apps/notification-service/infrastructure/email/templates/iris_';

    switch (template) {
      case EmailTemplate.PROJECT_SUBMITTED:      return base + 'project_submitted.html';
      case EmailTemplate.PROJECT_APPROVED:       return base + 'project_approved.html';
      case EmailTemplate.PROJECT_REJECTED:       return base + 'project_rejected.html';
      case EmailTemplate.REQUEST_CHANGES:        return base + 'requested_changes.html';
      case EmailTemplate.JUROR_INVITATION:       return base + 'juror_invitation.html';
      case EmailTemplate.PASSWORD_CHANGED:       return base + 'password_changed.html';
      case EmailTemplate.PASSWORD_RESET:         return base + 'password_reset.html';
      case EmailTemplate.PLATFORM_INVITATION:    return base + 'platform_invitation.html';
      case EmailTemplate.SIGNUP_CONFIRMATION:    return base + 'signup_confirmation.html';
      case EmailTemplate.PARTICIPANTS_SUBMITTED: return base + 'participants_submitted.html';
      case EmailTemplate.PARTICIPANTS_APPROVED:  return base + 'participants_approved.html';
      case EmailTemplate.PARTICIPANTS_REJECTED:  return base + 'participants_rejected.html';
      default:
        throw new Error(`Unsupported email template: ${template}`);
    }
  }

  private async sendWithEmailJs(to: string, subject: string, html: string): Promise<void> {
    await emailjs.send(
      this.emailJsServiceId!,
      this.emailJsTemplateId!,
      {
        to_email: to,
        subject,
        message_html: html,
      },
      {
        publicKey: this.emailJsPublicKey!,
        privateKey: this.emailJsPrivateKey!,
      },
    );
  }

  private async sendWithAzure(to: string, subject: string, html: string): Promise<void> {
    const message: EmailMessage = {
      senderAddress: this.azureSenderAddress!,
      recipients: { to: [{ address: to }] },
      content: {
        subject,
        plainText: 'This email requires a plaintext message.',
        html,
      },
    };

    await this.azureClient!.beginSend(message, {
      abortSignal: AbortSignal.timeout(15_000),
    });
  }

  async sendEmail(templateParams: SendEmailParams): Promise<{ success: boolean }> {
    const { to, template, params } = templateParams;

    this.logger.log('Preparing email...', { to, template });

    const templatePath = this.resolveTemplatePath(template);
    const fileContent = await fs.readFile(templatePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const compiledParams = {
      currentYear: new Date().getFullYear(),
      ...(params || {}),
    };

    const compiledHtml = handlebars.compile(content)(compiledParams);
    const compiledSubject = handlebars.compile(data.subject)(compiledParams);

    // EmailJS — primary provider
    try {
      this.logger.log('Sending email with EmailJS...', { to, template, subject: compiledSubject });
      await this.sendWithEmailJs(to, compiledSubject, compiledHtml);
      this.logger.log('Email sent successfully via EmailJS', { to, template, subject: compiledSubject });
      return { success: true };
    } catch (emailJsError) {
      this.logger.warn('EmailJS failed. Attempting Azure ACS fallback...', {
        to,
        template,
        subject: compiledSubject,
        error: emailJsError,
      });
    }

    // Azure ACS — fallback
    if (!this.azureClient || !this.azureSenderAddress) {
      this.logger.error('Azure ACS fallback not configured', { to, template });
      throw new Error('Failed to send email: both providers unavailable');
    }

    try {
      this.logger.log('Sending email with Azure ACS fallback...', { to, template, subject: compiledSubject });
      await this.sendWithAzure(to, compiledSubject, compiledHtml);
      this.logger.log('Email sent successfully via Azure ACS', { to, template, subject: compiledSubject });
      return { success: true };
    } catch (azureError) {
      this.logger.error('Both email providers failed', {
        to,
        template,
        subject: compiledSubject,
        error: azureError,
      });
      throw new Error('Failed to send email');
    }
  }
}
