import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { Role } from '../roles/role.model';
import { List } from '../lists/list.model';

interface UserCreationAttributes {
  username: string;
  password: string;
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserCreationAttributes> {
  @ApiProperty({
    example: '1c6e6134-7d4a-4b39-8ca4-4d53fddf16f2',
    description: 'UUIDV4 as UserId (PK)',
  })
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({ example: 'MaximKalin', description: 'Nickname of the user' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  username: string;

  @ApiProperty({ example: 'qwerty123', description: 'Password of User' })
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  password: string;

  @ApiProperty({
    example: '15',
    description: 'The quantity of user tasks',
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
    description: 'Foreign Key for the role bond (UUID)',
  })
  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
  })
  role_id: string;

  @BelongsTo(() => Role, { foreignKey: 'role_id' })
  role: Role;

  @HasMany(() => List, { foreignKey: 'user_id' })
  list: List[];
}
