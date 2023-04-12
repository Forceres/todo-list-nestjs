import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { hash, compare } from 'bcrypt';

import { User } from './user.model';

import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { UpdateRoleDto } from '../roles/dto/update.role.dto';

import { RoleService } from '../roles/role.service';

import { CRYPT_SALT } from '../../environments/env';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RoleService
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const isUserExists = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (isUserExists)
      throw new HttpException(
        'The user with such a username already exists!',
        HttpStatus.BAD_REQUEST
      );
    const { password } = dto;
    const role = await this.roleService.getRoleByTitle('USER');
    const hashed = await hash(password, CRYPT_SALT);
    const user = await this.userRepository.create({ ...dto, password: hashed });
    await user.$set('role', role);
    user.role = role;
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll({ include: { all: true } });
    return users;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      include: { all: true },
    });
    if (!user) throw new NotFoundException('This user not found!');
    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username: username },
      include: { all: true },
    });
    if (!user) throw new NotFoundException('This user not found!');
    return user;
  }

  async updatePassword(id: string, dto: UpdateUserDto): Promise<User> {
    const checkUser = await this.userRepository.findOne({ where: { id: id } });
    if (checkUser === null) throw new NotFoundException('This user not found');
    const { password } = dto;
    const equalPassword = await compare(password, checkUser.password);
    if (equalPassword)
      throw new HttpException(
        { reason: 'You entered the same password!' },
        HttpStatus.BAD_REQUEST
      );
    const hashed = await hash(password, CRYPT_SALT);
    await this.userRepository.update(
      { password: hashed, updatedAt: new Date() },
      { where: { id: id } }
    );
    return await this.userRepository.findOne({
      where: { id: id },
      include: { all: true },
    });
  }

  async updateUserRole(id: string, dto: UpdateRoleDto) {
    const user = await this.userRepository.findOne({ where: { id: id }, include: {all: true} });
    if (!user) throw new NotFoundException('This user not found');
    if (user.role.title === dto.title) throw new HttpException('The user already has this role!', HttpStatus.BAD_REQUEST);
    const role = await this.roleService.getRoleByTitle(dto.title);
    user.role_id = role.id;
    await user.save();
    return await this.userRepository.findByPk(user.id, {
      include: { all: true },
    });
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.userRepository.destroy({
      where: { id: id },
    });
    if (user === 0) throw new NotFoundException('This user not found');
  }
}
