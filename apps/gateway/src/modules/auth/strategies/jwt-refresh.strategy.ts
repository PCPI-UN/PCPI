import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const refreshPublicKey = Buffer.from(
      configService.get<string>('JWT_REFRESH_PUBLIC_KEY', ''),
      'base64',
    ).toString('ascii');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshPublicKey,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.authService.getUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return { ...user, refreshToken };
    } catch (e) {
      throw new UnauthorizedException('Failed to validate refresh token');
    }
  }
}
