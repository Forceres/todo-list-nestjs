import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUppercase, Length } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'MODERATOR',
    description: 'The title of the role',
  })
  @IsNotEmpty({ message: 'Rolename cannot be empty!' })
  @IsUppercase({ message: 'Rolename must be UPPERCASE' })
  @Length(4, 15, { message: 'Rolename must be between 4 and 15 chars' })
  readonly title: string;
}
