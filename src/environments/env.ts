import { config } from 'dotenv';
import { join } from 'path';

config({
  path: join(__dirname, '../../.env'),
});

// Application port
const PORT: number = +process.env.PORT || 4000;

// Secret key for JWT token
const SECRET_KEY: string = process.env.SECRET_KEY || 'secret';

// Expiration Time
const TOKEN_EXPIRATION: number = +process.env.TOKEN_EXPIRATION || 3600;

// Secret key for Refresh token
const SECRET_REFRESH_KEY: string = process.env.SECRET_REFRESH_KEY || 'refresh';

// Refresh token expiration time
const REFRESH_TOKEN_EXPIRATION: number =
  +process.env.REFRESH_TOKEN_EXPIRATION || 72000;

// Salt for password to hash
const CRYPT_SALT: number = +process.env.CRYPT_SALT || 10;

// Database configurations
const POSTGRES_HOST: string = process.env.POSTGRES_HOST || 'postgres';
const POSTGRES_PORT: number = +process.env.POSTGRES_PORT || 5432;
const POSTGRES_USER: string = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD || 'postgres';
const POSTGRES_DB: string = process.env.POSTGRES_DB || 'postgres';

// Log level
const LEVELS = { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 };
const LOG_LEVEL: string =
  Object.keys(LEVELS).find((key) => LEVELS[key] === +process.env.LOG_LEVEL) ||
  'info';

// log size
const LOG_FILE_SIZE_MB: number = +process.env.LOG_FILE_SIZE_MB || 5;

export {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  PORT,
  CRYPT_SALT,
  SECRET_KEY,
  TOKEN_EXPIRATION,
  SECRET_REFRESH_KEY,
  REFRESH_TOKEN_EXPIRATION,
  LOG_FILE_SIZE_MB,
  LOG_LEVEL,
  LEVELS,
};
