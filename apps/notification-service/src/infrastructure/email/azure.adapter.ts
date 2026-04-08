import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
const matter = require('gray-matter');
import * as handlebars from 'handlebars';
import { EmailTemplate } from '@app/common/generated/notification';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import {
  EmailServicePort,
  SendEmailParams,
} from '@/application/ports/email.service.port';

@Injectable()
export class AzureAdapter implements EmailServicePort, OnModuleInit {
  private readonly logger = new Logger(AzureAdapter.name);
  private client: EmailClient;
  constructor(private readonly configService: ConfigService) {}
  azureConnectionString: string | undefined;
  azureSenderAddress: string | undefined;
  onModuleInit() {

    // Before everything else, we need to check if we have a connection string and sender address
    this.azureConnectionString = this.configService.get<string>('ACS_CONNECTION_STRING');
    this.azureSenderAddress = this.configService.get<string>('ACS_SENDER_ADDRESS');

    if (!this.azureConnectionString) {
      this.logger.error('ACS_CONNECTION_STRING is not configured');
      throw new Error('Azure Communication Services connection string configuration error');
    }

    if (!this.azureSenderAddress) {
      this.logger.error('ACS_SENDER_ADDRESS is not configured');
      throw new Error('Azure Communication Services sender address configuration error');
    }

    this.client = new EmailClient(this.azureConnectionString);
  }

  async sendEmail(templateParams: SendEmailParams): Promise<{ success: boolean }> {
    this.logger.log('Sending email...', { to: templateParams.to, template: templateParams.template });
    const { to, template, params } = templateParams;

    // Map the EmailTemplate enum to the corresponding HTML template file
    let templatePath = 'dist/apps/notification-service/infrastructure/email/templates/iris_';
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
        templatePath += 'requested_changes.html'
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
        throw new Error(`Unsupported email template: ${template}`);
    }

    // Read the template file and extract the subject and HTML body
    const fileContent = await fs.readFile(templatePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const subject = data.subject;
    const htmlBody = content;

    let compiledHtml: string;
    let compiledSubject: string;

    // Replace params in the HTML body and subject
    compiledHtml = handlebars.compile(htmlBody)(params);
    compiledSubject = handlebars.compile(subject)(params);

    const message: EmailMessage = {
      senderAddress: this.azureSenderAddress!,
      recipients: {
        to: [{ address: to }],
      },
      content: {
        subject: compiledSubject,
        plainText: "This email requires a plaintext message.", // Ignore this. This doesn't show
        html: compiledHtml,
      },
    };

    try {
      const poller = await this.client.beginSend(message);
      const result = await poller.pollUntilDone();

      this.logger.log(`Email sent successfully. MessageId: ${result.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw new Error('Failed to send email');
    }
  }
}
