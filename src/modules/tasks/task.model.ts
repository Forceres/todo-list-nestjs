import { ApiProperty } from '@nestjs/swagger';
import {
  Model,
  Column,
  Table,
  DataType,
  UpdatedAt,
  CreatedAt,
  ForeignKey,
  BelongsTo,
  BeforeSave,
  BeforeDestroy,
} from 'sequelize-typescript';

import { List } from '../lists/list.model';

interface TaskCreateAttributes {
  title: string;
  description: string;
  urgency?: string;
}

@Table({ tableName: 'task' })
export class Task extends Model<Task, TaskCreateAttributes> {
  @ApiProperty({
    example: '1c6e6134-7d4a-4b39-8ca4-4d53fddf16f2',
    description: 'UUIDV4 as TaskId (PK)',
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    unique: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({
    example: 'Fixing up the bug',
    description: 'Short title of the task',
  })
  @Column({ type: DataType.STRING, allowNull: false, unique: false })
  title: string;

  @ApiProperty({
    example:
      'Company XYZ wants to update the design of its website to improve its appearance and increase user appeal. The new design should be modern, attractive, and user-friendly. It is necessary to create a design that will correspond to the company brand and goals',
    description: 'Full description of the task',
  })
  @Column({ type: DataType.TEXT, unique: false, allowNull: false })
  description: string;

  @ApiProperty({
    example: 'LOW',
    description: 'The extent of the task urgency',
    default: 'LOW',
  })
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
    defaultValue: 'LOW',
  })
  urgency: string;

  @ApiProperty({
    example: false,
    description: 'The state of completion',
    default: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    unique: false,
    allowNull: false,
    defaultValue: false,
  })
  isDone: boolean;

  @ApiProperty({
    example: '01/02/2000, 15:23:11',
    description: 'Date and time of creation',
  })
  @CreatedAt
  @Column({
    type: DataType.DATE,
    get() {
      const date = this.getDataValue('createdAt');
      const formattedDate = new Date(date).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      return formattedDate;
    },
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @ApiProperty({
    example: '01/02/2000, 15:23:11',
    description: 'Date and time of update',
  })
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    get() {
      const date = this.getDataValue('updatedAt');
      const formattedDate = new Date(date).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      return formattedDate;
    },
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;

  @ApiProperty({
    example: '1c6e6134-7d4a-4b39-8ca4-4d53fddf16f2',
    description: 'Foreign Key for the user bond (UUID)',
  })
  @ForeignKey(() => List)
  @Column({
    type: DataType.UUID,
  })
  list_id: string;

  @BelongsTo(() => List, { foreignKey: 'list_id' })
  list: List;

  @BeforeSave
  static async updateTasksQuantityHookBeforeSave(instance: Task) {
    if (instance.list_id) {
      const list = await List.findByPk(instance.list_id, { include: Task });
      await list.update(
        { tasks_quantity: list['task'].length + 1 },
        { silent: false }
      );
    }
  }

  @BeforeDestroy
  static async updateTasksQuantityHookBeforeDestroy(instance: Task) {
    const list = await List.findByPk(instance.list_id, { include: Task });
    await list.update(
      { tasks_quantity: list['task'].length - 1 },
      { silent: false }
    );
  }
}
