import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  reasons: string[];

  constructor(res: string[]) {
    super(res, HttpStatus.BAD_REQUEST);
    this.reasons = res;
  }
}
