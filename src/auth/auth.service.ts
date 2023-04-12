import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { UserService } from '../modules/users/user.service';
import { User } from '../modules/users/user.model';
import { AuthDto } from './dto/auth.dto';
import { UpdateUserDto } from '../modules/users/dto/update.user.dto';

import {
  REFRESH_TOKEN_EXPIRATION,
  SECRET_KEY,
  SECRET_REFRESH_KEY,
  TOKEN_EXPIRATION,
} from '../environments/env';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.getUserByUsername(username);
    const isValid = await compare(password, user.password);
    if (isValid) {
      return user;
    }
    return null;
  }

  async signUp(authDto: AuthDto): Promise<any> {
    return await this.userService.createUser(authDto);
  }

  async signIn(user: User): Promise<any> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async getProfile(user: User): Promise<User> {
    const profile = await this.userService.getUserById(user.id) 
    return profile;
  }

  async updatePassword(user: User, dto: UpdateUserDto): Promise<User> {
    return await this.userService.updatePassword(user.id, dto);
  }

  async isRefreshValid(refreshObj: { refreshToken: string }) {
    const { refreshToken } = refreshObj;
    if (!refreshToken)
      throw new UnauthorizedException('There is no refresh token!');
    try {
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret: SECRET_REFRESH_KEY,
      });
      const user = await this.userService.getUserById(id);
      return await this.signIn(user);
    } catch {
      throw new ForbiddenException('Refresh token is invalid or expired!');
    }
  }

  private async generateAccessToken(user: User): Promise<string> {
    const { id, username, role } = user;
    const accessToken = await this.jwtService.signAsync(
      { id: id, username: username, role: role },
      {
        secret: SECRET_KEY,
        expiresIn: TOKEN_EXPIRATION,
      }
    );
    return accessToken;
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const { id, username, role } = user;
    const refreshToken = await this.jwtService.signAsync(
      {
        id: id,
        username: username,
        role: role,
      },
      {
        secret: SECRET_REFRESH_KEY,
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      }
    );
    return refreshToken;
  }
}
