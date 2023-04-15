import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from './role.model';
import { RoleService } from './role.service';

import { Roles } from './role.decorator';

import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @ApiOperation({ summary: 'Getting the role by its title' })
  @ApiResponse({ status: HttpStatus.OK, type: Role })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, type: ForbiddenException })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: NotFoundException })
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(RoleGuard)
  @Get(':title')
  async getRoleByTitle(@Param('title') title: string) {
    return this.roleService.getRoleByTitle(title);
  }
}
