import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUppercase, Length } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'MODERATOR',
    description: 'The title of the role',
  })
  @IsNotEmpty({ message: 'Rolename cannot be empty!' })
  @IsUppercase({ message: 'Rolename must be UPPERCASE' })
  @Length(4, 15, { message: 'Rolename must be between 4 and 15 chars' })
  readonly title: string;

  @ApiProperty({
    example: 'Advanced access to all endpoints',
    description: 'Short description of the role',
  })
  @IsNotEmpty({ message: 'Description cannot be empty!' })
  @IsString({ message: 'Description must be string type' })
  @Length(4, 100, { message: 'Description must be between 4 and 100 chars' })
  readonly description: string;
}
