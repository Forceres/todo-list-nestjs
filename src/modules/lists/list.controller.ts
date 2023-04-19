import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Put,
  Delete,
  ValidationPipe,
  HttpStatus,
  UsePipes,
  UseGuards,
  NotFoundException,
  Request,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { List } from './list.model';
import { ListService } from './list.service';

import { CreateListDto } from './dto/create.list.dto';
import { UpdateListDto } from './dto/update.list.dto';

import { ValidationException } from '../../common/exceptions/validation.exception';

import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';

@ApiTags('Lists')
@Controller('lists')
export class ListController {
  constructor(private listService: ListService) {}

  @ApiOperation({ summary: 'List creation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: List,
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
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post()
  @ApiBearerAuth('JWT-auth')
  async create(
    @Request() req,
    @Body() createListDto: CreateListDto
  ): Promise<List> {
    return await this.listService.createList(req.user, createListDto);
  }

  @ApiOperation({
    summary: 'Get the specific list of the user by the id of the list',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the list',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: List,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The id has not uuid format!',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  async getOne(@Param('id') id: string): Promise<List> {
    return await this.listService.getUserListByID(id);
  }

  @ApiOperation({ summary: 'Get all user lists by user_id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [List],
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  async getAll(@Request() req): Promise<List[]> {
    return await this.listService.getUserListsByUserId(req.user);
  }

  @ApiOperation({ summary: 'Update list title' })
  @ApiParam({
    name: 'id',
    description: 'The id of the list',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: List,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'List not found!',
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The id has not uuid format!',
  })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto
  ): Promise<List> {
    return await this.listService.updateListTitle(req.user, id, updateListDto);
  }

  @ApiOperation({ summary: 'Delete list' })
  @ApiParam({
    name: 'id',
    description: 'The id of the list',
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
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'List not found!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The id has not uuid format!',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.listService.deleteUserListById(req.user, id);
  }
}
