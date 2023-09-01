import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './modules/users/user.model';
import { UserModule } from './modules/users/user.module';

import { Role } from './modules/roles/role.model';
import { RoleModule } from './modules/roles/role.module';

import { List } from './modules/lists/list.model';
import { ListModule } from './modules/lists/list.module';

import { Task } from './modules/tasks/task.model';
import { TaskModule } from './modules/tasks/task.module';

import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger.module';

import { LoggerService } from './common/logger/logger.service';
import { MorganMiddleware } from './common/middleware/morgan.middleware';

import {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from './environments/env';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      models: [User, Role, List, Task],
      autoLoadModels: true,
      synchronize: false,
      logging: (message) => {
        const logger = new LoggerService();
        logger.verbose(message);
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend'),
      serveRoot: '/frontend',
      serveStaticOptions: {
        index: ['index.html'],
      },
      exclude: ['/users, /auth, /roles, /lists, /tasks, /api'],
    }),
    UserModule,
    RoleModule,
    AuthModule,
    ListModule,
    TaskModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
