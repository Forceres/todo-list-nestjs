import {
  Body,
  Request,
  Controller,
  Post,
  UseGuards,
  HttpStatus,
  HttpException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../modules/users/user.model';
import { CreateUserDto } from '../modules/users/dto/create.user.dto';
import { AuthService } from './auth.service';
import { ValidationException } from '../common/exceptions/validation.exception';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { JwtAuthGuard } from './guards/jwt.auth.guard';

@ApiTags('Registration&Authentication&Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ValidationException })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, type: HttpException })
  @UsePipes(ValidationPipe)
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @ApiOperation({ summary: 'Authorization' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req) {
    return await this.authService.signIn(req.user);
  }

  @ApiOperation({ summary: 'Information about authorized user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Object,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Update refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Object,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @Post('refresh')
  async refresh(@Request() req) {
    return await this.authService.isRefreshValid(req.body);
  }
}
