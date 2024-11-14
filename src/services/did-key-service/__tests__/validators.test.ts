import { parse } from 'did-resolver';
import { InvalidDIDError } from '../errors';
import { VerificationMethodTypes } from '../types';
import {
  isSupportedKeyFormat,
  isValidatePublicKeyLength,
  isValidDID,
  isValidDIDURL,
  validateIdentifier,
} from '../validators';

jest.mock('did-resolver', () => ({
  parse: jest.fn(),
}));

describe('Validators', () => {
  describe('isSupportedKeyFormat', () => {
    it('should return true for supported formats', () => {
      expect(isSupportedKeyFormat(VerificationMethodTypes.Multikey)).toBe(true);
      expect(isSupportedKeyFormat(VerificationMethodTypes.JsonWebKey2020)).toBe(true);
      expect(isSupportedKeyFormat(VerificationMethodTypes.Ed25519VerificationKey2020)).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedKeyFormat('UnsupportedFormat' as VerificationMethodTypes)).toBe(false);
    });
  });

  describe('isValidatePublicKeyLength', () => {
    it('should validate Ed25519 key length correctly', () => {
      const validKey = new Uint8Array(32);
      expect(isValidatePublicKeyLength('Ed25519', validKey)).toBe(true);

      const invalidKey = new Uint8Array(31);
      expect(isValidatePublicKeyLength('Ed25519', invalidKey)).toBe(false);
    });

    it('should validate Secp256k1 key length correctly', () => {
      const validKey = new Uint8Array(33);
      expect(isValidatePublicKeyLength('Secp256k1', validKey)).toBe(true);

      const invalidKey = new Uint8Array(32);
      expect(isValidatePublicKeyLength('Secp256k1', invalidKey)).toBe(false);
    });
  });

  describe('isValidDID', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true for valid DID', () => {
      (parse as jest.Mock).mockImplementation(() => ({}));
      expect(isValidDID('did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH')).toBe(true);
    });

    it('should return false for invalid DID', () => {
      (parse as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid DID');
      });
      expect(isValidDID('invalid:did')).toBe(false);
    });
  });

  describe('isValidDIDURL', () => {
    it('should validate correct DID URLs', () => {
      expect(isValidDIDURL('did:key:123#key-1')).toBe(true);
      expect(isValidDIDURL('did:example:123#key-1')).toBe(true);
    });

    it('should reject invalid DID URLs', () => {
      expect(isValidDIDURL('invalid-url')).toBe(false);
      expect(isValidDIDURL('did:key:123')).toBe(false);
      expect(isValidDIDURL('did:key:123#')).toBe(false);
    });
  });

  describe('validateIdentifier', () => {
    it('should not throw for valid identifier parts', () => {
      expect(() => validateIdentifier('did', 'key', '1', 'z123')).not.toThrow();
    });

    it('should throw for invalid scheme', () => {
      expect(() => validateIdentifier('invalid', 'key', '1', 'z123')).toThrow(InvalidDIDError);
    });

    it('should throw for invalid method', () => {
      expect(() => validateIdentifier('did', 'invalid', '1', 'z123')).toThrow(InvalidDIDError);
    });

    it('should throw for invalid version', () => {
      expect(() => validateIdentifier('did', 'key', '0', 'z123')).toThrow(InvalidDIDError);
      expect(() => validateIdentifier('did', 'key', 'invalid', 'z123')).toThrow(InvalidDIDError);
    });

    it('should throw for invalid multibase value', () => {
      expect(() => validateIdentifier('did', 'key', '1', 'invalid')).toThrow(InvalidDIDError);
    });
  });
});
