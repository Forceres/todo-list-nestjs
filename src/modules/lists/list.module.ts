import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist';

import { List } from './list.model';
import { ListService } from './list.service';
import { ListController } from './list.controller';

import { UserModule } from '../users/user.module';

@Module({
  imports: [SequelizeModule.forFeature([List]), forwardRef(() => UserModule)],
  providers: [ListService],
  exports: [ListService],
  controllers: [ListController],
})
export class ListModule {}
