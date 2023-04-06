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
import { UpdateUserDto } from './dto/update.user.dto';
import { User } from './user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ValidationException } from 'src/common/exceptions/validation.exception';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @ApiOperation({ summary: 'User creation' })
  // @ApiResponse({ status: HttpStatus.OK, type: User })
  // @ApiResponse({ status: HttpStatus.FORBIDDEN, type: ForbiddenException })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ValidationException })
  // @UsePipes(ValidationPipe)
  // @Post()
  // async create(@Body() userDto: CreateUserDto): Promise<User> {
  //   return await this.userService.createUser(userDto);
  // }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, type: [User] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @ApiOperation({ summary: "Update user's password" })
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ValidationException })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return await this.userService.updatePassword(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.OK, type: Promise<void> })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.removeUser(id);
  }
}
