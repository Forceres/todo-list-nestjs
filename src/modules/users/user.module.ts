import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist';
import { RoleModule } from '../roles/role.module';
import { UserController } from './user.controller';
import { User } from './user.model';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
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
