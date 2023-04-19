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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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
  @ApiParam({
    name: 'title',
    description: 'The title of the role',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Role,
    description: 'Successful request!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedException,
    description: 'Unauthorized!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenException,
    description: 'Not enough access to this endpoint!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundException,
    description: 'Role not found!',
  })
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':title')
  @ApiBearerAuth('JWT-auth')
  async getRoleByTitle(@Param('title') title: string) {
    return this.roleService.getRoleByTitle(title);
  }
}
