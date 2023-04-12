import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Role } from './role.model';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [
    SequelizeModule.forFeature([Role]),
    JwtModule
  ],
  exports: [RoleService],
})
export class RoleModule {}
