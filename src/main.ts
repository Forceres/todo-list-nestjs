import { NestFactory } from '@nestjs/core';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { SwaggerModule } from '@nestjs/swagger/dist';

import { AppModule } from './app.module';

import { PORT } from './environments/env';
import { LoggerService } from './common/logger/logger.service';
import * as jsYaml from 'js-yaml';
import { readFileSync } from 'fs';

async function start() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
      logger: new LoggerService(),
    });
    const swaggerYaml = readFileSync('doc/api.yaml', 'utf8');

    const document = jsYaml.load(swaggerYaml);

    SwaggerModule.setup('/doc/api', app, document);

    await app.listen(PORT, () => {
      Logger.log(`Server started on PORT: ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      Logger.error(err);
    });

    process.on('uncaughtException', (err) => {
      Logger.error(err);
    });
  } catch (error) {
    Logger.error(`while starting server, ${error}`, '', 'Start', false);
    throw new InternalServerErrorException('Internal Server Error', error);
  }
}

start().catch(() => {
  process.exit(1);
});
