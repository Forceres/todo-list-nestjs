import { Column, CreatedAt, DataType, Is, Model, Table, UpdatedAt } from 'sequelize-typescript';

interface UserCreationAttributes {
  username: string;
  password: string;
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserCreationAttributes> {
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
  @Column({ type: DataType.INTEGER, unique: false, defaultValue: 0 })
  tasks_quantity: number;
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
