import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';

import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  constructor(private logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    morgan.token('message', (_req, res) => {
      return res.statusMessage;
    });
    morgan.format(
      'custom',
      ':method :url :status :message ResponseLength - :res[content-length] - :response-time ms'
    );
    morgan('custom', {
      stream: {
        write: (message: string) => {
          if (res.statusCode >= 400)
            this.logger.error(message, res.errored?.stack);
          if (res.statusCode < 400) this.logger.log(message);
        },
      },
    })(req, res, next);
  }
}
