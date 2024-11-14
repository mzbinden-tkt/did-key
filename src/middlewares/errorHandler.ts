import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors';
import logger from '../utils/logger';

export const errorHandler = (error: Error, req: Request, res: Response, _: NextFunction) => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'] || 'unknown',
  });

  if (error instanceof BaseError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
};
