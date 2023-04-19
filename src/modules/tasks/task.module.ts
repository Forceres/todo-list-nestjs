import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist';

import { Task } from './task.model';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

import { UserModule } from '../users/user.module';
import { ListModule } from '../lists/list.module';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [SequelizeModule.forFeature([Task]), ListModule, UserModule],
  exports: [TaskService],
})
export class TaskModule {}
