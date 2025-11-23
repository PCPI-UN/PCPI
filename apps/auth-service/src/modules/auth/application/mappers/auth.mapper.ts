import {
  LoginResponse,
  RefreshResponse,
  SetPasswordResponse,
  ValidateTokenResponse,
  ForgotPasswordResponse,
  ChangePasswordResponse,
} from '@app/common/generated/auth';

import { UserTokenType } from '@users/domain/entities/user-token.entity';

export class AuthMapper {
  static toLoginResponse(accessToken: string, refreshToken: string): LoginResponse {
    return {
      accessToken,
      refreshToken,
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
}
