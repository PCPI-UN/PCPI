import {
  LoginResponse,
  RefreshResponse,
  SetPasswordResponse,
  ValidateTokenResponse,
} from '@app/common/generated/auth';

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

  static toValidateTokenResponse(valid: boolean, userId: number): ValidateTokenResponse {
    return {
      valid,
      userId,
    };
  }
}
