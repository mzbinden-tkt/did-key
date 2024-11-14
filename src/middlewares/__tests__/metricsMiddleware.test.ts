import { Request, Response } from 'express';
import { metricsMiddleware } from '../metricsMiddleware';
import { incrementMetricTimer } from '../../metrics';

jest.mock('../../metrics');

describe('Metrics Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockRequest = {
      method: 'GET',
      path: '/test',
      headers: {
        'x-request-id': 'test-id',
      },
      get: jest.fn().mockReturnValue('test-user-agent'),
    };
    mockResponse = {
      statusCode: 200,
      end: jest.fn(),
      get: jest.fn().mockReturnValue('100'),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should track request metrics and call next', () => {
    metricsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should track response metrics when request ends', () => {
    metricsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const modifiedResponse = mockResponse as Response;
    modifiedResponse.end!();

    expect(incrementMetricTimer).toHaveBeenCalledWith(
      'response_time',
      expect.any(Number),
      expect.arrayContaining([
        expect.stringContaining('timestamp:'),
        'method: GET',
        'path: /test',
        'statusCode: 200',
        'userAgent: test-user-agent',
        'contentLength: 100',
        'requestId: test-id',
      ])
    );
  });

  it('should handle missing request ID', () => {
    mockRequest.headers = {};

    metricsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
  });

  it('should handle missing user agent and content length', () => {
    (mockRequest.get as jest.Mock).mockReturnValue(null);
    (mockResponse.get as jest.Mock).mockReturnValue(null);

    metricsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    const modifiedResponse = mockResponse as Response;
    modifiedResponse.end!();

    expect(incrementMetricTimer).toHaveBeenCalledWith(
      'response_time',
      expect.any(Number),
      expect.arrayContaining(['userAgent: unknown', 'contentLength: 0'])
    );
  });
});
