import { getGeneratorKey } from '../key-manager';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';

describe('Key Manager', () => {
  describe('getGeneratorKey', () => {
    it('should return a valid Ed25519 key generator', () => {
      const generator = getGeneratorKey({ type: 'Ed25519' });
      const keys = generator();

      expect(keys).toHaveProperty('public');
      expect(keys).toHaveProperty('private');
      expect(keys.public).toBeInstanceOf(Uint8Array);
      expect(keys.private).toBeInstanceOf(Uint8Array);

      const derivedPublicKey = ed25519.utils.getExtendedPublicKey(keys.private).pointBytes;
      expect(Buffer.from(keys.public)).toEqual(Buffer.from(derivedPublicKey));
    });

    it('should return a valid Secp256k1 key generator', () => {
      const generator = getGeneratorKey({ type: 'Secp256k1' });
      const keys = generator();

      expect(keys).toHaveProperty('public');
      expect(keys).toHaveProperty('private');
      expect(keys.public).toBeInstanceOf(Uint8Array);
      expect(keys.private).toBeInstanceOf(Uint8Array);

      const derivedPublicKey = secp256k1.getPublicKey(keys.private);
      expect(Buffer.from(keys.public)).toEqual(Buffer.from(derivedPublicKey));
    });
  });
});
