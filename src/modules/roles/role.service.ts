import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Role } from './role.model';
import { CreateRoleDto } from './dto/create.role.dto';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(dto: CreateRoleDto) {
    const role = this.roleRepository.create(dto);
    return role;
  }

  async getRoleByTitle(title: string) {
    const role = this.roleRepository.findOne({ where: { title } });
    if (!role) throw new NotFoundException('There is not such a role!');
    return role;
  }
}
