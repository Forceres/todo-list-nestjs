import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from './role.model';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create.role.dto';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @ApiOperation({ summary: 'Role creating' })
  @ApiResponse({ status: HttpStatus.OK, type: Role })
  @UsePipes(ValidationPipe)
  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: 'Getting the role by its title' })
  @ApiResponse({ status: HttpStatus.OK, type: Role })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @Get(':title')
  async getRoleByTitle(@Param('title') title: string) {
    return this.roleService.getRoleByTitle(title);
  }
}
