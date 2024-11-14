import { BaseError } from './BaseError';

export class NotFoundError extends BaseError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}
