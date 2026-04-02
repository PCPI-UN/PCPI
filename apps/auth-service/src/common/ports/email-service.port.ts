export abstract class EmailServicePort {
  abstract sendPasswordResetEmail(
    to: string,
    token: string,
    expiresInMinutes: number,
  ): Promise<void>;

  abstract sendPasswordChangeConfirmation(
    to: string,
    userName: string,
  ): Promise<void>;

  abstract sendSignupConfirmationEmail(params: {
    to: string;
    firstName: string;
    invitationLink: string;
  }): Promise<{ success: boolean }>;
}
