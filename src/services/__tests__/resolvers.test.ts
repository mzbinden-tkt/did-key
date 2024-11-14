import { createDIDKey } from '../resolvers';
import { saveDIDDocument, saveKeyPair } from '../did-document-service';
import { bytesToMultibase } from 'did-jwt';
import { createDIDDocument } from '../did-key-service';

jest.mock('../did-document-service');
jest.mock('did-jwt');
jest.mock('../did-key-service');
jest.mock('../../utils/logger');

describe('Resolvers', () => {
  describe('createDIDKey', () => {
    const mockKeyPair = {
      public: new Uint8Array([1, 2, 3]),
      private: new Uint8Array([4, 5, 6]),
    };

    const mockMultibase = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

    const mockDIDDocument = {
      '@context': [],
      id: `did:key:${mockMultibase}`,
      verificationMethod: [],
      authentication: [],
    };

    const mockCreateKey = jest.fn().mockReturnValue(mockKeyPair);

    beforeEach(() => {
      jest.clearAllMocks();
      (bytesToMultibase as jest.Mock).mockReturnValue(mockMultibase);
      (createDIDDocument as jest.Mock).mockReturnValue(mockDIDDocument);
      (saveDIDDocument as jest.Mock).mockResolvedValue(undefined);
      (saveKeyPair as jest.Mock).mockResolvedValue(undefined);
    });

    it('should create a DID key successfully with Ed25519', async () => {
      const result = await createDIDKey('Ed25519', mockCreateKey);

      expect(result).toEqual({ document: mockDIDDocument });
      expect(mockCreateKey).toHaveBeenCalled();
      expect(bytesToMultibase).toHaveBeenCalledWith(mockKeyPair.public, 'base58btc', 'ed25519-pub');
      expect(createDIDDocument).toHaveBeenCalledWith(`did:key:${mockMultibase}`, undefined);
      expect(saveDIDDocument).toHaveBeenCalledWith(mockDIDDocument);
      expect(saveKeyPair).toHaveBeenCalledWith(mockKeyPair.public, mockKeyPair.private);
    });

    it('should create a DID key successfully with Secp256k1', async () => {
      const result = await createDIDKey('Secp256k1', mockCreateKey);

      expect(result).toEqual({ document: mockDIDDocument });
      expect(bytesToMultibase).toHaveBeenCalledWith(
        mockKeyPair.public,
        'base58btc',
        'secp256k1-pub'
      );
    });

    it('should create a DID key with custom options', async () => {
      await createDIDKey('Ed25519', mockCreateKey, { enableEncryptionKeyDerivation: true });

      expect(createDIDDocument).toHaveBeenCalledWith(`did:key:${mockMultibase}`, {
        enableEncryptionKeyDerivation: true,
      });
    });

    it('should propagate errors from key generation', async () => {
      const error = new Error('Key generation failed');
      const failingCreateKey = jest.fn().mockImplementation(() => {
        throw error;
      });

      await expect(createDIDKey('Ed25519', failingCreateKey)).rejects.toThrow(error);
    });

    it('should propagate errors from document save', async () => {
      const error = new Error('Document save failed');
      (saveDIDDocument as jest.Mock).mockRejectedValue(error);

      await expect(createDIDKey('Ed25519', mockCreateKey)).rejects.toThrow(error);
    });

    it('should propagate errors from key pair save', async () => {
      const error = new Error('Key pair save failed');
      (saveKeyPair as jest.Mock).mockRejectedValue(error);

      await expect(createDIDKey('Ed25519', mockCreateKey)).rejects.toThrow(error);
    });
  });
});
