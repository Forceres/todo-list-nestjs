import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist';
import { RoleModule } from '../roles/role.module';
import { UserController } from './user.controller';
import { User } from './user.model';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [SequelizeModule.forFeature([User]), RoleModule],
  exports: [UserService],
})
export class UserModule {}
