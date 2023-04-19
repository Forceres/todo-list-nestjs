import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Task } from './task.model';

import { TaskService } from './task.service';

import { CreateTaskDto } from './dto/create.task.dto';
import { UpdateTaskDto } from './dto/update.task.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { ValidationException } from '../../common/exceptions/validation.exception';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @ApiOperation({ summary: 'Task creation' })
  @ApiParam({
    name: 'list_id',
    description: 'The id of the list',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Task,
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
    type: ValidationException,
    description: 'Validation failed!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The list_id has not uuid format!',
  })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post(':list_id')
  @ApiBearerAuth('JWT-auth')
  async create(
    @Request() req,
    @Param('list_id') id: string,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<Task> {
    return await this.taskService.createTask(req.user, id, createTaskDto);
  }

  @ApiOperation({ summary: 'Get the specific user task by the id of the task' })
  @ApiParam({
    name: 'id',
    description: 'The id of the task',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Task,
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
    description: 'Task not found!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The task_id has not uuid format!',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  async getOne(@Request() req, @Param('id') id: string): Promise<Task> {
    return await this.taskService.getOneTask(req.user, id);
  }

  @ApiOperation({ summary: 'Get all user tasks by the id of the list' })
  @ApiParam({
    name: 'list_id',
    description: 'The id of the list',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [Task],
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
    description: 'The list_id has not uuid format!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'List not found!',
  })
  @UseGuards(JwtAuthGuard)
  @Get('all/:list_id')
  @ApiBearerAuth('JWT-auth')
  async getAll(@Request() req, @Param('list_id') id: string): Promise<Task[]> {
    return await this.taskService.getAllTasks(req.user, id);
  }

  @ApiOperation({ summary: 'Update 1-4 attributes of the task' })
  @ApiParam({
    name: 'id',
    description: 'The id of the task',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Task,
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
    description: 'Task not found!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ValidationException,
    description: 'Validation failed!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The task_id has not uuid format!',
  })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    return await this.taskService.updateTask(req.user, id, updateTaskDto);
  }

  @ApiOperation({ summary: 'Delete the specific task by the id' })
  @ApiParam({
    name: 'id',
    description: 'The id of the task',
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
    status: HttpStatus.BAD_REQUEST,
    type: HttpException,
    description: 'The task_id has not uuid format!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'Task not found!',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return await this.taskService.deleteTaskById(req.user, id);
  }
}
