import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateListDto {
  @ApiProperty({
    example: 'Work List',
    description: 'Short title for your List of Tasks',
  })
  @IsNotEmpty({ message: 'This attribute cannot be empty!' })
  @IsString({ message: 'It must be string type!' })
  @Length(10, 40, { message: 'Title must be between 10 and 40 chars' })
  readonly title: string;
}
