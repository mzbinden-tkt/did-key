import { Request, Response } from 'express';
import { BadRequestError } from '../../errors';
import { createDIDKey, getGeneratorKey } from '../../services';
import { createDIDController } from '../did';

jest.mock('../../services');

describe('DID Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('create DID controller', () => {
    const mockDIDDocument = {
      id: 'did:key:123',
      verificationMethod: [],
    };

    beforeEach(() => {
      (createDIDKey as jest.Mock).mockResolvedValue(mockDIDDocument);
      (getGeneratorKey as jest.Mock).mockReturnValue('mock-key');
    });

    it('should create a DID document with Ed25519 key type', async () => {
      mockRequest.body = {
        method: 'key',
        keyType: 'Ed25519',
        options: {},
      };

      await createDIDController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(getGeneratorKey).toHaveBeenCalledWith({ type: 'Ed25519' });
      expect(createDIDKey).toHaveBeenCalledWith('Ed25519', 'mock-key', {});
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDIDDocument);
    });

    it('should create a DID document with Secp256k1 key type', async () => {
      mockRequest.body = {
        method: 'key',
        keyType: 'Secp256k1',
        options: {},
      };

      await createDIDController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(getGeneratorKey).toHaveBeenCalledWith({ type: 'Secp256k1' });
      expect(createDIDKey).toHaveBeenCalledWith('Secp256k1', 'mock-key', {});
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDIDDocument);
    });

    it('should throw BadRequestError for invalid method', async () => {
      mockRequest.body = {
        method: 'invalid',
        keyType: 'Ed25519',
      };

      await createDIDController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(createDIDKey).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid keyType', async () => {
      mockRequest.body = {
        method: 'key',
        keyType: 'InvalidKeyType',
      };

      await createDIDController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(createDIDKey).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        method: 'key',
        keyType: 'Ed25519',
      };

      const error = new Error('Service error');
      (createDIDKey as jest.Mock).mockRejectedValue(error);

      await createDIDController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
