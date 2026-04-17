import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '#constants';

export class NotFoundException extends HttpException {
  constructor(message = ERROR_MESSAGE.RESOURCE_NOT_FOUND, details = null) {
    super(404, message, details);
  }
}
