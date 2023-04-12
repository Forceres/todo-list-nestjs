import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { List } from './list.model';
import { CreateListDto } from './dto/create.list.dto';
import { UpdateListDto } from './dto/update.list.dto';
import { User } from '../users/user.model';

@Injectable()
export class ListService {
  constructor(@InjectModel(List) private listRepository: typeof List) {}

  async createList(user: User, dto: CreateListDto): Promise<List> {
    const list = await this.listRepository.create(dto);
    if (!list)
      throw new HttpException('List is not created!', HttpStatus.BAD_REQUEST);
    const listEntity = await this.listRepository.findOne({
      where: { user_id: null },
    });
    listEntity.user_id = user.id;
    await listEntity.save();
    return await this.listRepository.findOne({
      where: { id: listEntity.id },
    });
  }

  async getUserListByID(id: string): Promise<List> {
    const list = await this.listRepository.findByPk(id, {
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
    const isListExists = await this.listRepository.findOne({
      where: { user_id: user.id, id: id },
    });
    if (!isListExists) throw new NotFoundException('List not found!');
    this.listRepository.update({ title: dto.title }, { where: { id: id } });
    return await this.listRepository.findOne({
      where: { id: id },
      include: { all: true },
    });
  }

  async deleteUserListById(user: User, id: string): Promise<void> {
    const listOwnership = await this.listRepository.findOne({
      where: { user_id: user.id, id: id },
    });
    if (!listOwnership)
      throw new ForbiddenException('You do not have such a list');
    const list = await this.listRepository.destroy({
      where: { id: id },
    });
    if (list === 0) throw new NotFoundException('List not found');
  }
}
