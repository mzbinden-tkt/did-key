import { bytesToMultibase, multibaseToBytes } from 'did-jwt';
import { createDIDDocument } from '../service';
import {
  isSupportedKeyFormat,
  isValidDIDURL,
  isValidatePublicKeyLength,
  isValidDID,
} from '../validators';
import { createJWK } from '../jwk';
import { convertEd25519PublicKeyToX25519 } from '../converts';

jest.mock('../validators');
jest.mock('did-jwt');
jest.mock('../converts');
jest.mock('../jwk');

describe('Did Key service', () => {
  const mockPublicDidKey = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'

  beforeEach(() => {
    jest.clearAllMocks();

    (createJWK as jest.Mock).mockResolvedValue({ kty: 'OKP', crv: 'Ed25519' });
    (convertEd25519PublicKeyToX25519 as jest.Mock).mockResolvedValue(new Uint8Array(32));
    (bytesToMultibase as jest.Mock).mockReturnValue('z123');
    (multibaseToBytes as jest.Mock).mockReturnValue({ keyBytes: new Uint8Array(32), keyType: 'Ed25519' });
  });

  describe('createDIDDocument', () => {
    beforeEach(() => {
      (isSupportedKeyFormat as jest.Mock).mockReturnValue(true);
      (isValidatePublicKeyLength as jest.Mock).mockReturnValue(true);
      (isValidDIDURL as jest.Mock).mockReturnValue(true);
      (isValidDID as jest.Mock).mockReturnValue(true);
    });

    it('should create a valid DID document', async () => {
      const result = await createDIDDocument(mockPublicDidKey);

      expect(result).toMatchObject({
        '@context': expect.any(Array),
        id: mockPublicDidKey,
        verificationMethod: expect.any(Array),
        authentication: expect.any(Array),
        assertionMethod: expect.any(Array),
      });
    });
  });
}); 