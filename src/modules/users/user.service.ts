import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create.user.dto';
import { User } from './user.model';
import { hash } from 'bcrypt';
import { CRYPT_SALT } from 'src/environments/env';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const { username, password } = dto;
    const hashed = await hash(password, CRYPT_SALT);
    const newDto = { username: username, password: hashed };
    const user = await this.userRepository.create(newDto);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll({ include: { all: true } });
    return users;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    return user;
  }

  async updatePassword(id: string, dto: UpdateUserDto): Promise<User> {
    const checkUser = await this.userRepository.findOne({ where: { id: id } });
    if (checkUser === null) throw new NotFoundException('This user not found');
    const { password } = dto;
    const hashed = await hash(password, CRYPT_SALT);
    await this.userRepository.update({ password: hashed }, { where: { id: id } });
    return await this.userRepository.findOne({ where: { id: id } });
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.userRepository.destroy({
      where: { id: id },
    });
    if (user === 0) throw new NotFoundException('This user not found');
  }
}
