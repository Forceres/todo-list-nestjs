import { Model, Table } from "sequelize-typescript";


@Table({tableName: 'role'})
export class Role extends Model<Role>{}