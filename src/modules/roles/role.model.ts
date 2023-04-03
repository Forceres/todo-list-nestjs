import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { User } from '../users/user.model';

interface RoleCreationAttributes {
  title: string;
  description: string;
}

@Table({ tableName: 'role', updatedAt: false, createdAt: false })
export class Role extends Model<Role, RoleCreationAttributes> {
  @ApiProperty({
    example: '1c6e6134-7d4a-4b39-8ca4-4d53fddf16f2',
    description: 'UUIDV4 as RoleId (PK)',
  })
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({ example: 'ADMIN', description: 'Name of Role' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  title: string;

  @ApiProperty({
    example: 'Administator with full rights',
    description: 'Short information of Role',
  })
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  description: string;

  @HasMany(() => User, { foreignKey: 'role_id' })
  user: User[];
}
