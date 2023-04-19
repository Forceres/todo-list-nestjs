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
  HasMany,
  BeforeDestroy,
  BeforeUpdate,
} from 'sequelize-typescript';

import { User } from '../users/user.model';
import { Task } from '../tasks/task.model';

interface ListCreateAttributes {
  title: string;
}

@Table({ tableName: 'list' })
export class List extends Model<List, ListCreateAttributes> {
  @ApiProperty({
    example: '1c6e6134-7d4a-4b39-8ca4-4d53fddf16f2',
    description: 'UUIDV4 as ListId (PK)',
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
    example: 'Specific Work Tasks',
    description: 'Short title for your List of Tasks',
  })
  @Column({ type: DataType.STRING, allowNull: false, unique: false })
  title: string;

  @ApiProperty({
    example: '15',
    description: 'The quantity of list tasks',
    default: 0,
  })
  @Column({ type: DataType.INTEGER, unique: false, defaultValue: 0 })
  tasks_quantity: number;

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
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  user_id: string;

  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user: User;

  @HasMany(() => Task, { foreignKey: 'list_id' })
  task: Task[];

  @BeforeUpdate
  static async updateTasksQuantityHookBeforeUpdate(
    instance: List,
    options: any
  ) {
    if (options.fields.includes('tasks_quantity')) {
      const list = await List.findByPk(instance.id, { include: Task });
      const quantityDifference = instance.tasks_quantity - list.tasks_quantity;
      const user = await User.findByPk(instance.user_id, { include: List });
      await user.update(
        {
          tasks_quantity: user.tasks_quantity + quantityDifference,
        },
        { silent: false }
      );
    }
  }

  @BeforeDestroy
  static async updateTasksQuantityHookBeforeDestroy(instance: List) {
    const user = await User.findByPk(instance.user_id, { include: List });
    await user.update(
      {
        tasks_quantity: user.tasks_quantity - instance.tasks_quantity,
      },
      { silent: false }
    );
  }
}
