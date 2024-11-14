import { getDIDDocument, saveDIDDocument, saveKeyPair } from '../did-document-service';
import { findDocumentDid, saveDocumentDid, saveKeys } from '../../repository';
import { NotFoundError } from '../../errors';
import logger from '../../utils/logger';

jest.mock('../../repository');
jest.mock('../../utils/logger');

describe('DID Document Service', () => {
  const mockDIDDocument = {
    '@context': [],
    id: 'did:example:123',
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    capabilityDelegation: [],
    capabilityInvocation: [],
    keyAgreement: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDIDDocument', () => {
    it('should return a DID document when found', async () => {
      (findDocumentDid as jest.Mock).mockResolvedValue(mockDIDDocument);

      const result = await getDIDDocument('did:example:123');

      expect(result).toEqual({ document: mockDIDDocument });
      expect(findDocumentDid).toHaveBeenCalledWith('did:example:123');
      expect(logger.debug).toHaveBeenCalledWith('Starting DID document retrieval process');
      expect(logger.debug).toHaveBeenCalledWith('DID document retrieved successfully');
    });

    it('should throw NotFoundError when document is not found', async () => {
      (findDocumentDid as jest.Mock).mockResolvedValue(null);

      await expect(getDIDDocument('did:example:123')).rejects.toThrow(NotFoundError);
      expect(logger.error).toHaveBeenCalledWith('DID document not found for ID: did:example:123');
    });

    it('should propagate unexpected errors', async () => {
      const error = new Error('Database error');
      (findDocumentDid as jest.Mock).mockRejectedValue(error);

      await expect(getDIDDocument('did:example:123')).rejects.toThrow(error);
    });
  });

  describe('saveDIDDocument', () => {
    it('should save a DID document successfully', async () => {
      (saveDocumentDid as jest.Mock).mockResolvedValue(undefined);

      await saveDIDDocument(mockDIDDocument);

      expect(saveDocumentDid).toHaveBeenCalledWith(mockDIDDocument);
      expect(logger.debug).toHaveBeenCalledWith('Starting DID document save process');
      expect(logger.debug).toHaveBeenCalledWith('DID document saved successfully');
    });

    it('should propagate errors during save', async () => {
      const error = new Error('Save failed');
      (saveDocumentDid as jest.Mock).mockRejectedValue(error);

      await expect(saveDIDDocument(mockDIDDocument)).rejects.toThrow(error);
    });
  });

  describe('saveKeyPair', () => {
    it('should save a key pair successfully', async () => {
      const mockPublicKey = new Uint8Array([1, 2, 3]);
      const mockPrivateKey = new Uint8Array([4, 5, 6]);
      (saveKeys as jest.Mock).mockResolvedValue(undefined);

      await saveKeyPair(mockPublicKey, mockPrivateKey);

      expect(saveKeys).toHaveBeenCalledWith(mockPublicKey, mockPrivateKey);
      expect(logger.debug).toHaveBeenCalledWith('Starting key pair save process');
      expect(logger.debug).toHaveBeenCalledWith('Key pair saved successfully');
    });

    it('should propagate errors during key pair save', async () => {
      const error = new Error('Key save failed');
      const mockPublicKey = new Uint8Array([1, 2, 3]);
      const mockPrivateKey = new Uint8Array([4, 5, 6]);
      (saveKeys as jest.Mock).mockRejectedValue(error);

      await expect(saveKeyPair(mockPublicKey, mockPrivateKey)).rejects.toThrow(error);
    });
  });
}); 