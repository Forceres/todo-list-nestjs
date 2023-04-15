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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: HttpStatus.OK, type: List })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ValidationException })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Request() req,
    @Body() createListDto: CreateListDto
  ): Promise<List> {
    return await this.listService.createList(req.user, createListDto);
  }

  @ApiOperation({
    summary: 'Get the specific list of the user by the id of the list',
  })
  @ApiResponse({ status: HttpStatus.OK, type: List })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<List> {
    return await this.listService.getUserListByID(id);
  }

  @ApiOperation({ summary: 'Get all user lists by user_id' })
  @ApiResponse({ status: HttpStatus.OK, type: [List] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Request() req): Promise<List[]> {
    return await this.listService.getUserListsByUserId(req.user);
  }

  @ApiOperation({ summary: 'Update list title' })
  @ApiResponse({ status: HttpStatus.OK, type: List })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ValidationException })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto
  ): Promise<List> {
    return await this.listService.updateListTitle(req.user, id, updateListDto);
  }

  @ApiOperation({ summary: 'Delete list' })
  @ApiResponse({ status: HttpStatus.OK, type: Promise<void> })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.listService.deleteUserListById(req.user, id);
  }
}
