import { config } from 'dotenv';

config();

export default {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    migrationStorageTableName: 'SequelizeMeta',
    seederStorage: 'sequelize',
  },
};
