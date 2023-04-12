import { IsNotEmpty, IsUppercase, Length } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'Rolename cannot be empty!' })
  @IsUppercase({ message: 'Rolename must be UPPERCASE' })
  @Length(4, 15, { message: 'Rolename must be between 4 and 15 chars' })
  readonly title: string;
}
