import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleController } from './role.controller';
import { Role } from './role.model';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [SequelizeModule.forFeature([Role])],
  exports: [RoleService],
})
export class RoleModule {}
