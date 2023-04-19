import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsUppercase,
  IsOptional,
  IsBoolean,
} from 'class-validator';

import { CreateTaskDto } from './create.task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    example: 'Fixing up the bug',
    description: 'Short title of the task',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'It must be string type!' })
  @Length(8, 25, {
    message: 'The title of the task must be between 8 and 25 chars',
  })
  readonly title: string;

  @ApiProperty({
    example:
      'Company XYZ wants to update the design of its website to improve its appearance and increase user appeal. The new design should be modern, attractive, and user-friendly. It is necessary to create a design that will correspond to the company brand and goals',
    description: 'Full description of the task',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'It must be string type!' })
  @Length(10, 500, { message: 'Description must be between 10 and 500 chars' })
  readonly description: string;

  @ApiProperty({
    example: 'LOW',
    description: 'The extent of the task urgency',
    required: false,
  })
  @IsOptional()
  @IsUppercase({ message: 'Urgency must be UPPERCASE' })
  @Length(3, 6, { message: 'Urgency must be between 3 and 6 chars' })
  readonly urgency: string;

  @ApiProperty({
    example: false,
    description: 'The state of completion',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Urgency must be boolean type' })
  readonly isDone: boolean;
}
