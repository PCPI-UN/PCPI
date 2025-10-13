export interface SendEmailParams {
  template: string;
  templateParams: Record<string, unknown>;
  to?: string;
}

export abstract class EmailServicePort {
  abstract sendEmail(params: SendEmailParams): Promise<{ success: boolean }>;
}
