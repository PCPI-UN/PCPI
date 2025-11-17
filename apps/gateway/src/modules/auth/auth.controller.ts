import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBody,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppUser } from './types/app-user.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login to the system' })
  @ApiResponse({ status: 200, description: 'Login successful. Sets access_token and refresh_token as HTTP-only cookies.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    const accessTokenExpiration = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
      '15m',
    );
    const refreshTokenExpiration = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION',
      '7d',
    );

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.isSecureContext(),
      sameSite: 'strict',
      maxAge: this.parseJwtExpiration(accessTokenExpiration),
    });
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.isSecureContext(),
      sameSite: 'strict',
      maxAge: this.parseJwtExpiration(refreshTokenExpiration),
    });
    return { success: true, message: 'Login successful' };
  }

  @Post('logout')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Logout from the system' })
  @ApiResponse({ status: 200, description: 'Logout successful, clears all auth cookies' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Returns new access token and sets it in cookie' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken } = req.user;
    const { accessToken } = await this.authService.refresh(refreshToken);

    const accessTokenExpiration = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
      '15m',
    );

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.isSecureContext(),
      sameSite: 'strict',
      maxAge: this.parseJwtExpiration(accessTokenExpiration),
    });

    return { success: true, message: 'Token refreshed successfully' };
  }

  @Get('me')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user profile with roles and permissions (platform-specific)' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  getProfile(@GetUser() user: AppUser) {
    return user;
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if account exists)' })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token or weak password' })
  @ApiResponse({ status: 404, description: 'Token not found or expired' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Put('password')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Change password (authenticated users)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully. All refresh tokens invalidated.' })
  @ApiResponse({ status: 400, description: 'Weak password or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Current password is incorrect' })
  async changePassword(
    @GetUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  /**
   * Determines if cookies should use the 'secure' flag
   * Returns true only in production AND when insecure cookies are not explicitly allowed
   * This allows testing production builds locally over HTTP
   */
  private isSecureContext(): boolean {
    const nodeEnv = this.configService.get('NODE_ENV');
    const isProduction = nodeEnv === 'production';

    // Allow insecure cookies in production if explicitly set (for local testing)
    const allowInsecure = this.configService.get('ALLOW_INSECURE_COOKIES') === 'true';

    return isProduction && !allowInsecure;
  }

  /**
   * Converts JWT expiration string (e.g., '15m', '7d', '1h') to milliseconds
   */
  private parseJwtExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2] as 's' | 'm' | 'h' | 'd';

    const multipliers: Record<'s' | 'm' | 'h' | 'd', number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
