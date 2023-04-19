import { ConsoleLogger, Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { Logger } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { LEVELS, LOG_FILE_SIZE_MB, LOG_LEVEL } from '../../environments/env';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private logger: Logger;

  constructor() {
    super();

    const customFormat = format.combine(
      format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
      format.ms(),
      format.errors({ stack: true }),
      format.json(),
      format.align(),
      format.printf((info) => {
        const { timestamp, level, message, ms, ...args } = info;
        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} ${level} ${message.trim()} ${
          Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
        }`.endsWith('ms ')
          ? `${ts} ${level} ${message.trim()} ${
              Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
            }`
          : `${ts} ${level} ${message.trim()} ${
              Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
            } ${ms.replace('+', '')}`;
      })
    );

    this.logger = createLogger({
      levels: LEVELS,
      level: LOG_LEVEL,
      format: customFormat,
      handleRejections: true,
      handleExceptions: true,
      transports: [
        new DailyRotateFile({
          filename: 'logs/all/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          json: true,
          level: 'info',
          maxSize: `${LOG_FILE_SIZE_MB * 1024}k`,
          maxFiles: '14d',
          zippedArchive: true,
        }),
        new DailyRotateFile({
          filename: 'logs/exceptions/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          json: true,
          level: 'error',
          maxSize: `${LOG_FILE_SIZE_MB * 1024}k`,
          maxFiles: '14d',
          zippedArchive: true,
        }),
        new transports.Console({
          format: format.combine(format.colorize({ all: true })),
        }),
      ],
    });
  }

  error(message: string, trace: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  log(message: string): void {
    this.logger.info(message);
  }

  verbose(message: string): void {
    this.logger.verbose(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  silly(message: string): void {
    this.logger.silly(message);
  }
}
