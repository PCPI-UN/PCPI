import {
  LoginResponse,
  SignupResponse,
  RefreshResponse,
  SetPasswordResponse,
  ValidateTokenResponse,
  ForgotPasswordResponse,
  ChangePasswordResponse,
  GenerateAccountSetupTokenResponse,
} from '@app/common/generated/auth';

import { UserTokenType } from '@users/domain/entities/user-token.entity';

export class AuthMapper {
  static toLoginResponse(accessToken: string, refreshToken: string): LoginResponse {
    return {
      accessToken,
      refreshToken,
    };
  }

  static toSignupResponse(id: number, email: string, firstName: string, lastName: string, phone: string, active: boolean, status: string): SignupResponse {
    return {
      id,
      email,
      firstName,
      lastName,
      phone,
      active,
      status,
    };
  }

  static toRefreshResponse(accessToken: string): RefreshResponse {
    return {
      accessToken,
    };
  }

  static toSetPasswordResponse(success: boolean): SetPasswordResponse {
    return {
      success,
    };
  }

  static toValidateTokenResponse(valid: boolean, tokenType: UserTokenType): ValidateTokenResponse {
    return { valid, tokenType };
  }

  static toForgotPasswordResponse(success: boolean, message: string): ForgotPasswordResponse {
    return {
      success,
      message,
    };
  }

  static toChangePasswordResponse(success: boolean, message: string): ChangePasswordResponse {
    return {
      success,
      message,
    };
  }

  static toGenerateAccountSetupTokenResponse(
    token: string,
    expiresAt: Date,
  ): GenerateAccountSetupTokenResponse {
    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
