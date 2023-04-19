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
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '../modules/users/user.model';

import { CreateUserDto } from '../modules/users/dto/create.user.dto';
import { UpdateUserDto } from '../modules/users/dto/update.user.dto';

import { AuthService } from './auth.service';

import { ValidationException } from '../common/exceptions/validation.exception';

import { LocalAuthGuard } from './guards/local.auth.guard';
import { JwtAuthGuard } from './guards/jwt.auth.guard';

@ApiTags('Registration&Authentication&Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: User,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ValidationException,
    description: 'Validation failed!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The user with this username already exists!',
  })
  @UsePipes(ValidationPipe)
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @ApiOperation({ summary: 'Authorization' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: User,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req) {
    return await this.authService.signIn(req.user);
  }

  @ApiOperation({ summary: 'Information about authorized user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Object,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  async getProfile(@Request() req) {
    return await this.authService.getProfile(req.user);
  }

  @ApiOperation({ summary: 'Update the password of the authorized user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ValidationException,
    description: 'Validation failed!',
  })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put('update')
  @ApiBearerAuth('JWT-auth')
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return await this.authService.updatePassword(req.user, updateUserDto);
  }

  @ApiOperation({ summary: 'Update accessToken' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Object,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @Post('refresh')
  async refresh(@Request() req) {
    return await this.authService.isRefreshValid(req.body);
  }
}
