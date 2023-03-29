import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'username98', description: 'Nickname P.S. Login' })
  @IsNotEmpty({ message: 'This attribute cannot be empty!' })
  @IsString({ message: 'It must be string type!' })
  @Length(8, 25, { message: 'Username must be between 8 and 25 chars' })
  readonly username: string;

  @ApiProperty({ example: 'qwerty123', description: "User's password" })
  @IsNotEmpty({ message: 'This attribute cannot be empty!' })
  @IsString({ message: 'It must be string type!' })
  @Length(8, 30, { message: 'Password must be between 8 and 30 chars' })
  readonly password: string;
}
