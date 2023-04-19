import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { SECRET_KEY } from '../../environments/env';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride('role', [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!requiredRoles) return true;
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      const jwtToken = authHeader.split(' ')[1];
      const user = await this.jwtService.verifyAsync(jwtToken, {
        secret: SECRET_KEY,
      });
      request.user = user;
      return await requiredRoles.includes(user.role.title);
    } catch (err) {
      throw new ForbiddenException('Unauthorized!');
    }
  }
}
