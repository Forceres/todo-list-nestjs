import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from './user.model';
import { UserService } from './user.service';

import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { ValidationException } from '../../common/exceptions/validation.exception';

import { Roles } from '../roles/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guard';
import { UpdateRoleDto } from '../roles/dto/update.role.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [User],
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenException,
    description: 'Not enough access to this endpoint!',
  })
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  async getAll(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({
    name: 'id',
    description: 'The id of the user',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'User not found!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The id has not the uuid format!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenException,
    description: 'Not enough access to this endpoint',
  })
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'Change the role of the user' })
  @ApiParam({
    name: 'id',
    description: 'The id of the user',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'User not found!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ValidationException,
    description: 'Validation failed!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenException,
    description: 'Not enough access to this endpoint',
  })
  @UsePipes(ValidationPipe)
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<User> {
    return await this.userService.updateUserRole(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    description: 'The id of the user',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Promise<void>,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'User not found!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenException,
    description: 'Not enough access to this endpoint!',
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.removeUser(id);
  }
}
