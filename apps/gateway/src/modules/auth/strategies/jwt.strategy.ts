import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { AppUser } from '../types/app-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const publicKey = Buffer.from(
      configService.get<string>('JWT_PUBLIC_KEY', ''),
      'base64',
    ).toString('ascii');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<AppUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.authService.getUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const permissionsResponse =
        await this.authService.getUserPermissions(payload.sub);

      const appUser: AppUser = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        active: user.active,
        status: user.status,
        platformRoles: permissionsResponse.roles || [],
        platformPermissions: permissionsResponse.permissions || [],
      };

      return appUser;
    } catch (e) {
      throw new UnauthorizedException('Failed to validate user');
    }
  }
}
