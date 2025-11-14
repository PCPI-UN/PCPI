import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppUser } from '../../modules/auth/types/app-user.type';

export const GetUser = createParamDecorator(
  (data: keyof AppUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AppUser;
    console.log("Usuario en get-user.decorator", user);

    return data ? user?.[data] : user;
  },
);
