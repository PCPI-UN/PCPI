import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'this-is-not-used',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { valid, userId } = await this.authService.validateJwt(token);

      if (!valid) {
        throw new UnauthorizedException();
      }
      const user = await this.authService.getUser(userId);
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
