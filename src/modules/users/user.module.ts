import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist';

import { User } from './user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleModule } from '../roles/role.module';
import { AuthModule } from '../../auth/auth.module';
import { ListModule } from '../lists/list.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User]),
    RoleModule,
    forwardRef(() => AuthModule),
    ListModule,
  ],
  exports: [UserService],
})
export class UserModule {}
