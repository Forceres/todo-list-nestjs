import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/user.model';
import { UserModule } from './modules/users/user.module';
import { Role } from './modules/roles/role.model';
import { RoleModule } from './modules/roles/role.module';
import { AuthModule } from './auth/auth.module';
import { List } from './modules/lists/list.model';
import { ListModule } from './modules/lists/list.module';

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
      models: [User, Role, List],
      autoLoadModels: true,
      synchronize: false,
    }),
    UserModule,
    RoleModule,
    AuthModule,
    ListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
