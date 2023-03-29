import { ApiProperty } from '@nestjs/swagger';
import { AfterUpdate, Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

interface UserCreationAttributes {
  username: string;
  password: string;
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserCreationAttributes> {

  @ApiProperty({example: '1c6e6134-7d4a-4b39-8ca4-4d53fddf16f2', description: 'UUIDV4 as UserId (PK)'})
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
  id: string;
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  username: string;
  // @Is("Password", (val) => {
  //   if (!/^\w{8,64}/i.test(val)){
  //     throw new Error("Password must be from 8 chars to 30 chars without any special chars, apart from underscore");
  //   }
  // })

  @ApiProperty({example: 'qwerty123', description: 'Password of User'})
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
    // set(val: string) {
    //   if (!/^\w{8,64}/i.test(val))
    //     throw new Error(
    //       'Password must be from 8 chars to 30 chars without any special chars, apart from underscore'
    //     );
    //   this.setDataValue('password', hashSync(val, CRYPT_SALT));
    // },
  })
  password: string;

  @ApiProperty({example: '15', description: 'The quantity of user tasks'})
  @Column({ type: DataType.INTEGER, unique: false, defaultValue: 0 })
  tasks_quantity: number;

  // @AfterUpdate
  // static afterUpdate(instance: User){
  //   instance.updatedAt = new Date();
  // }

  @ApiProperty({example: '01/02/2000, 15:23:11', description: 'Date and time of creation'})
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

  @ApiProperty({example: '01/02/2000, 15:23:11', description: 'Date and time of update'})
  @UpdatedAt
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
  updatedAt: Date;
}
