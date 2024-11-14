import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { incrementMetricTimer } from '../metrics';
import logger from '../utils/logger';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  logger.debug('Request received', {
    method: req.method,
    path: req.path,
    requestId: req.headers['x-request-id'] || 'unknown',
  });

  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any, callback?: any) {
    const responseTime = performance.now() - startTime;

    logger.debug('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      requestId: req.headers['x-request-id'] || 'unknown',
    });

    const tags = [
      `timestamp: ${new Date().toISOString()}`,
      `method: ${req.method}`,
      `path: ${req.path}`,
      `statusCode: ${res.statusCode}`,
      `userAgent: ${req.get('user-agent') || 'unknown'}`,
      `contentLength: ${res.get('content-length') || 0}`,
      `requestId: ${req.headers['x-request-id'] || 'unknown'}`,
    ];

    incrementMetricTimer('response_time', responseTime, tags);

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};
