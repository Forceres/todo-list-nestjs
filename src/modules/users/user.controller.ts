import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: HttpStatus.OK, type: [User] })
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(RoleGuard)
  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(RoleGuard)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'Change the role of the user' })
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ValidationException })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<User> {
    return await this.userService.updateUserRole(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.OK, type: Promise<void> })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.removeUser(id);
  }
}
