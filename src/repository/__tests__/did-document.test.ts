import { Collection } from 'mongodb';
import { findDocumentDid, saveDocumentDid } from '../did-document';
import { DIDDocument } from '../../services/did-key-service';
import { BadRequestError } from '../../errors';

jest.mock('../client', () => ({
  getDatabase: jest.fn().mockReturnValue({
    collection: jest.fn(),
  }),
}));

describe('DID Document Repository', () => {
  let mockCollection: jest.Mocked<Collection>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn(),
      insertOne: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    (require('../client').getDatabase().collection as jest.Mock).mockReturnValue(mockCollection);
  });

  describe('findDocumentDid', () => {
    const mockDIDDocument: DIDDocument = {
      '@context': [],
      id: 'did:example:123',
      verificationMethod: [],
      authentication: [],
      assertionMethod: [],
      capabilityDelegation: [],
      capabilityInvocation: [],
      keyAgreement: [],
    };

    it('should find a DID document by ID', async () => {
      const mockToArray = jest.fn().mockResolvedValue([mockDIDDocument]);
      mockCollection.find.mockReturnValue({ toArray: mockToArray } as any);

      const result = await findDocumentDid('did:example:123');

      expect(mockCollection.find).toHaveBeenCalledWith({ id: 'did:example:123' });
      expect(result).toEqual(mockDIDDocument);
    });

    it('should return null when no document is found', async () => {
      const mockToArray = jest.fn().mockResolvedValue([]);
      mockCollection.find.mockReturnValue({ toArray: mockToArray } as any);

      const result = await findDocumentDid('did:example:nonexistent');

      expect(mockCollection.find).toHaveBeenCalledWith({ id: 'did:example:nonexistent' });
      expect(result).toBeNull();
    });

    it('should throw BadRequestError when didID is empty', async () => {
      await expect(findDocumentDid('')).rejects.toThrow(BadRequestError);
    });

    it('should propagate unexpected errors', async () => {
      const mockError = new Error('Database connection failed');
      mockCollection.find.mockImplementation(() => {
        throw mockError;
      });

      await expect(findDocumentDid('did:example:123')).rejects.toThrow(mockError);
    });
  });

  describe('saveDocumentDid', () => {
    const mockDIDDocument: DIDDocument = {
      '@context': [],
      id: 'did:example:123',
      verificationMethod: [],
      authentication: [],
      assertionMethod: [],
      capabilityDelegation: [],
      capabilityInvocation: [],
      keyAgreement: [],
    };

    it('should save a DID document successfully', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true } as any);

      await saveDocumentDid(mockDIDDocument);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockDIDDocument);
    });

    it('should propagate errors during save operation', async () => {
      const mockError = new Error('Insert failed');
      mockCollection.insertOne.mockRejectedValue(mockError);

      await expect(saveDocumentDid(mockDIDDocument)).rejects.toThrow(mockError);
    });
  });
});
