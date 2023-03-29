import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { User } from './user.model';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'User creation' })
  @ApiResponse({ status: 200, type: User })
  @UsePipes(ValidationPipe)
  @Post()
  async create(@Body() userDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(userDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: User })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @ApiOperation({ summary: "Update user's password" })
  @ApiResponse({ status: 201, type: User })
  @ApiResponse({ status: 404, type: NotFoundException })
  @UsePipes(ValidationPipe)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updatePassword(id, updateUserDto);
  }
  
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, type: Promise<void> })
  @ApiResponse({ status: 404, type: NotFoundException })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.removeUser(id);
  }
}
