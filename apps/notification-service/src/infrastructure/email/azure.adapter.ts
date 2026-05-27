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

  private client: EmailClient;

  private azureConnectionString: string | undefined;
  private azureSenderAddress: string | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.azureConnectionString = this.configService.get<string>(
      'ACS_CONNECTION_STRING',
    );

    this.azureSenderAddress = this.configService.get<string>(
      'ACS_SENDER_ADDRESS',
    );

    if (!this.azureConnectionString) {
      this.logger.error('ACS_CONNECTION_STRING is not configured');

      throw new Error(
        'Azure Communication Services connection string configuration error',
      );
    }

    if (!this.azureSenderAddress) {
      this.logger.error('ACS_SENDER_ADDRESS is not configured');

      throw new Error(
        'Azure Communication Services sender address configuration error',
      );
    }

    this.client = new EmailClient(this.azureConnectionString);
  }

  private async sendWithEmailJs(
    to: string,
    subject: string,
    html: string,
  ) {
    const serviceId = this.configService.get<string>(
      'EMAILJS_SERVICE_ID',
    );

    const templateId = this.configService.get<string>(
      'EMAILJS_TEMPLATE_ID',
    );

    const publicKey = this.configService.get<string>(
      'EMAILJS_PUBLIC_KEY',
    );

    const privateKey = this.configService.get<string>(
      'EMAILJS_PRIVATE_KEY',
    );

    if (
      !serviceId ||
      !templateId ||
      !publicKey ||
      !privateKey
    ) {
      throw new Error('EmailJS configuration is incomplete');
    }

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: to,
        subject,
        message_html: html,
      },
      {
        publicKey,
        privateKey,
      },
    );
  }

  async sendEmail(
    templateParams: SendEmailParams,
  ): Promise<{ success: boolean }> {
    const { to, template, params } = templateParams;

    this.logger.log('Preparing email...', {
      to,
      template,
    });

    let templatePath =
      'dist/apps/notification-service/infrastructure/email/templates/iris_';

    switch (template) {
      case EmailTemplate.PROJECT_SUBMITTED:
        templatePath += 'project_submitted.html';
        break;

      case EmailTemplate.PROJECT_APPROVED:
        templatePath += 'project_approved.html';
        break;

      case EmailTemplate.PROJECT_REJECTED:
        templatePath += 'project_rejected.html';
        break;

      case EmailTemplate.REQUEST_CHANGES:
        templatePath += 'requested_changes.html';
        break;

      case EmailTemplate.JUROR_INVITATION:
        templatePath += 'juror_invitation.html';
        break;

      case EmailTemplate.PASSWORD_CHANGED:
        templatePath += 'password_changed.html';
        break;

      case EmailTemplate.PASSWORD_RESET:
        templatePath += 'password_reset.html';
        break;

      case EmailTemplate.PLATFORM_INVITATION:
        templatePath += 'platform_invitation.html';
        break;

      case EmailTemplate.SIGNUP_CONFIRMATION:
        templatePath += 'signup_confirmation.html';
        break;

      case EmailTemplate.PARTICIPANTS_SUBMITTED:
        templatePath += 'participants_submitted.html';
        break;

      case EmailTemplate.PARTICIPANTS_APPROVED:
        templatePath += 'participants_approved.html';
        break;

      case EmailTemplate.PARTICIPANTS_REJECTED:
        templatePath += 'participants_rejected.html';
        break;

      default:
        throw new Error(
          `Unsupported email template: ${template}`,
        );
    }

    const fileContent = await fs.readFile(
      templatePath,
      'utf-8',
    );

    const { data, content } = matter(fileContent);

    const subject = data.subject;
    const htmlBody = content;

    const compiledParams = {
      currentYear: new Date().getFullYear(),
      ...(params || {}),
    };

    const compiledHtml =
      handlebars.compile(htmlBody)(compiledParams);

    const compiledSubject =
      handlebars.compile(subject)(compiledParams);

    const message: EmailMessage = {
      senderAddress: this.azureSenderAddress!,
      recipients: {
        to: [{ address: to }],
      },
      content: {
        subject: compiledSubject,
        plainText:
          'This email requires a plaintext message.',
        html: compiledHtml,
      },
    };

    try {
      this.logger.log(
        'Sending email with Azure Communication Services...',
        {
          to,
          template,
          subject: compiledSubject,
        },
      );

      await this.client.beginSend(message, {
        abortSignal: AbortSignal.timeout(15_000),
      });

      this.logger.log(
        'Email send request accepted by Azure ACS',
        {
          to,
          template,
          subject: compiledSubject,
        },
      );

      this.logger.log('Sending email with Azure Communication Services...', { to, subject: compiledSubject });
      const poller = await this.client.beginSend(message, {
        abortSignal: AbortSignal.timeout(15_000) // 15 segundos máximo
      });
      this.logger.log('Email send initiated, waiting for completion...', { to, subject: compiledSubject });
      //const result = await poller.pollUntilDone({
       // abortSignal: AbortSignal.timeout(30_000) // 30 segundos máximo
      //});

      //this.logger.log(`Email sent successfully. MessageId: ${poller.id}`);
      return { success: true };
    } catch (error) {
      if ((error as any)?.statusCode === 429) {
        this.logger.warn(
          'Azure ACS rate limit reached. Trying EmailJS fallback...',
          {
            to,
            template,
            subject: compiledSubject,
          },
        );

        try {
          await this.sendWithEmailJs(
            to,
            compiledSubject,
            compiledHtml,
          );

          this.logger.log(
            'Email sent successfully using EmailJS fallback',
            {
              to,
              template,
              subject: compiledSubject,
            },
          );

          return { success: true };
        } catch (emailJsError) {
          this.logger.error(
            'EmailJS fallback failed',
            {
              to,
              template,
              subject: compiledSubject,
              error: emailJsError,
            },
          );

          throw new Error('EMAIL_FALLBACK_FAILED');
        }
      }

      this.logger.error('Failed to send email', {
        to,
        template,
        subject: compiledSubject,
        error,
      });

      throw new Error('Failed to send email');
    }
  }
}