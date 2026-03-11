import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '#constants';

export class ConflictException extends HttpException {
  constructor(message = ERROR_MESSAGE.RESOURCE_CONFLICT, details = null) {
    super(409, message, details);
  }
}
