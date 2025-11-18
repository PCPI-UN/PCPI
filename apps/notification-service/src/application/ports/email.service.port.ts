import { EmailTemplate } from "@app/common/generated/notification";
export interface SendEmailParams {
  to: string;
  params: Record<string, any>;
  template: EmailTemplate;
}

export abstract class EmailServicePort {
  abstract sendEmail(params: SendEmailParams): Promise<{ success: boolean }>;
}
