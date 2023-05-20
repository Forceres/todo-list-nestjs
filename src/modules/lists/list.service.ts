import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { validate } from 'uuid';

import { List } from './list.model';
import { User } from '../users/user.model';

import { CreateListDto } from './dto/create.list.dto';
import { UpdateListDto } from './dto/update.list.dto';

@Injectable()
export class ListService {
  constructor(@InjectModel(List) private listRepository: typeof List) {}

  async createList(user: User, dto: CreateListDto): Promise<List> {
    const list = await this.listRepository.create(dto, { returning: true });
    list.user_id = user.id;
    const updatedList = await list.save();
    return updatedList;
  }

  async getUserListByID(id: string): Promise<List> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const list = await this.listRepository.findByPk(id, {
      include: { all: true },
    });
    if (!list) throw new NotFoundException('List not found!');
    return list;
  }

  async getUserListByUserId(user: User, id: string): Promise<List> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const list = await this.listRepository.findOne({
      where: { user_id: user.id, id: id },
      include: { all: true },
    });
    if (!list) throw new NotFoundException('List not found!');
    return list;
  }

  async getUserListsByUserId(user: User): Promise<List[]> {
    const lists = await this.listRepository.findAll({
      where: { user_id: user.id },
      include: { all: true },
    });
    return lists;
  }

  async updateListTitle(
    user: User,
    id: string,
    dto: UpdateListDto
  ): Promise<List> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const list = await this.listRepository.findOne({
      where: { user_id: user.id, id: id },
      include: { all: true },
    });
    if (!list) throw new NotFoundException('List not found!');
    await list.update({ title: dto.title }, { silent: false });
    await list.reload();
    return list;
  }

  async deleteUserListById(user: User, id: string): Promise<void> {
    if (!validate(id))
      throw new HttpException(
        'The id of the user is invalid!',
        HttpStatus.BAD_REQUEST
      );
    const listOwnership = await this.listRepository.findOne({
      where: { user_id: user.id, id: id },
    });
    if (!listOwnership)
      throw new NotFoundException('There is no such list in your account!');
    await this.listRepository.destroy({
      where: { id: id },
      individualHooks: true,
    });
  }
}
