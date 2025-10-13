import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token'];
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: 'this-will-be-ignored',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { valid, userId } = await this.authService.validateJwt(refreshToken);
      if (!valid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.authService.getUser(userId);
      if (!user) {
        throw new UnauthorizedException();
      }

      return { ...user, refreshToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
