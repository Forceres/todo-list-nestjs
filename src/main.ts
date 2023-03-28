import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { AppModule } from './app.module';
import { PORT } from './environments/env';

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configuration = new DocumentBuilder()
    .setTitle('TODO List')
    .setDescription('Documentation')
    .addTag('forceres')
    .build();
  const documentation = SwaggerModule.createDocument(app, configuration);
  SwaggerModule.setup('/api/doc', app, documentation);

  await app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
  });
}

start();
