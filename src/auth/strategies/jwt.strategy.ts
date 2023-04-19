import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Role } from '../../modules/roles/role.model';
import { UserService } from '../../modules/users/user.service';

import { SECRET_KEY } from '../../environments/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SECRET_KEY,
    });
  }

  async validate(payload: { id: string; username: string; role: Role }) {
    await this.userService.getUserById(payload.id);
    return { id: payload.id, username: payload.username, role: payload.role };
  }
}
