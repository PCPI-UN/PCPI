export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export abstract class EmailServicePort {
  abstract sendEmail(params: SendEmailParams): Promise<{ success: boolean }>;
}
