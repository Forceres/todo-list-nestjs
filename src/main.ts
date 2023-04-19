import { NestFactory } from '@nestjs/core';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { SwaggerModule } from '@nestjs/swagger/dist';
import { DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { PORT } from './environments/env';
import { LoggerService } from './common/logger/logger.service';

async function start() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
      logger: new LoggerService(),
    });

    const configuration = new DocumentBuilder()
      .setTitle('TODO List')
      .setDescription('Documentation')
      .setContact(
        'forceres',
        'https://github.com/Forceres',
        'ilya.sereda.2001@gmail.com'
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .build();
    const documentation = SwaggerModule.createDocument(app, configuration);
    SwaggerModule.setup('/api/doc', app, documentation);

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
