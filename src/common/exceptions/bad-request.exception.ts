import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '#constants';

export class BadRequestException extends HttpException {
  constructor(
    message = ERROR_MESSAGE.BAD_REQUEST,
    details: Record<string, string[]> | null = null,
  ) {
    super(400, message, details);
  }
}
