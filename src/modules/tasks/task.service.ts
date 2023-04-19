import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { validate } from 'uuid';

import { User } from '../users/user.model';

import { Task } from './task.model';

import { ListService } from '../lists/list.service';

import { CreateTaskDto } from './dto/create.task.dto';
import { UpdateTaskDto } from './dto/update.task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task) private taskRepository: typeof Task,
    private listService: ListService
  ) {}

  async createTask(user: User, id: string, dto: CreateTaskDto): Promise<Task> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    if (dto.urgency) {
      const urgencyList = ['LOW', 'MEDIUM', 'HIGH'];
      if (!urgencyList.includes(dto.urgency))
        throw new HttpException(
          `The urgency state - ${dto.urgency} is not compatible`,
          HttpStatus.BAD_REQUEST
        );
    }
    const list = await this.listService.getUserListByUserId(user, id);
    const task = await this.taskRepository.create(dto, {
      returning: true,
      include: { all: true },
    });
    if (!task)
      throw new HttpException('List is not created!', HttpStatus.BAD_REQUEST);
    task.list_id = list.id;
    const currentTask = await task.save();
    return currentTask;
  }

  async getAllTasks(user: User, id: string): Promise<Task[]> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const list = await this.listService.getUserListByUserId(user, id);
    const tasks = await this.taskRepository.findAll({
      where: { list_id: list.id },
      include: { all: true },
    });
    if (!tasks) throw new NotFoundException('Tasks not found');
    return tasks;
  }

  async getOneTask(user: User, id: string): Promise<Task> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const lists = await this.listService.getUserListsByUserId(user);
    const isOwner = lists.some((val) =>
      val.task.some((item) => item.id === id)
    );
    if (!isOwner) throw new NotFoundException('Task not found');
    const task = await this.taskRepository.findOne({
      where: { id: id },
      include: { all: true },
    });
    return task;
  }

  async updateTask(user: User, id: string, dto: UpdateTaskDto): Promise<Task> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    if (!dto.description && !dto.title && !dto.urgency)
      throw new HttpException(
        'You passed 0 args to update!',
        HttpStatus.BAD_REQUEST
      );
    if (dto.urgency) {
      const urgencyList = ['LOW', 'MEDIUM', 'HIGH'];
      if (!urgencyList.includes(dto.urgency))
        throw new HttpException(
          `The urgency state - ${dto.urgency} is not compatible`,
          HttpStatus.BAD_REQUEST
        );
    }
    const lists = await this.listService.getUserListsByUserId(user);
    const isOwner = lists.some((val) =>
      val.task.some((item) => item.id === id)
    );
    if (!isOwner) throw new NotFoundException('Task not found');
    const task = await this.taskRepository.findOne({
      where: { id: id },
    });
    if (!task) throw new NotFoundException('Task not found!');
    await task.update(
      {
        title: dto?.title,
        description: dto?.description,
        urgency: dto?.urgency,
        isDone: dto?.isDone,
      },
      { silent: false }
    );
    await task.reload();
    return task;
  }

  async deleteTaskById(user: User, id: string): Promise<void> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const lists = await this.listService.getUserListsByUserId(user);
    const isOwner = lists.some((val) =>
      val.task.some((item) => item.id === id)
    );
    if (!isOwner) throw new NotFoundException('Task not found');
    await this.taskRepository.destroy({
      where: { id: id },
      individualHooks: true,
    });
  }
}
