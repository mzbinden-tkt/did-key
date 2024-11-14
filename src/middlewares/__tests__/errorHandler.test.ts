import { Request, Response } from 'express';
import { errorHandler } from '../errorHandler';
import { BaseError } from '../../errors';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      method: 'GET',
      headers: {
        'x-request-id': 'test-id'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle BaseError instances correctly', () => {
    const error = new BaseError('Test error', 400, 'TEST_ERROR');
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      code: 'TEST_ERROR',
      message: 'Test error'
    });
  });

  it('should handle generic errors with 500 status code', () => {
    const error = new Error('Generic error');
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    });
  });
}); 