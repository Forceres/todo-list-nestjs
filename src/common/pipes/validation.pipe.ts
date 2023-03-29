import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const object = plainToClass(metadata.metatype, value);
    const errs = await validate(object);
    if (errs.length > 0) {
      const reasons = errs.map((err) => `${err.property}`);
      throw new ValidationException(reasons);
    }
    return value;
  }
}
