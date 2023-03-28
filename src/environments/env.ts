import { config } from 'dotenv';
import { join } from 'path';

config({
  path: join(__dirname, '../../.env'),
});

// Application port
const PORT: number = +process.env.PORT || 4000;

// Salt for password to hash
const CRYPT_SALT: number = +process.env.CRYPT_SALT || 10;

// Database configurations
const POSTGRES_HOST: string = process.env.POSTGRES_HOST || 'postgres';
const POSTGRES_PORT: number = +process.env.POSTGRES_PORT || 5432;
const POSTGRES_USER: string = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD || 'postgres';
const POSTGRES_DB: string = process.env.POSTGRES_DB || 'postgres';

export {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  PORT,
  CRYPT_SALT,
};
