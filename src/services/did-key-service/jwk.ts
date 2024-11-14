import type { JsonWebKey } from 'did-resolver';
import { bytesToBase64url, hexToBytes } from 'did-jwt';
import { secp256k1 } from '@noble/curves/secp256k1';
import { KNOWN_KEY_TYPE } from './types';
import { DIDKeyServiceError } from './errors';

export function createJWK(
  multicodecValue: KNOWN_KEY_TYPE,
  rawPublicKeyBytes: Uint8Array
): JsonWebKey | undefined {
  switch (multicodecValue) {
    case 'Secp256k1': {
      const point = secp256k1.ProjectivePoint.fromHex(rawPublicKeyBytes).toAffine();
      return {
        alg: 'ES256K',
        crv: 'secp256k1',
        kty: 'EC',
        x: bytesToBase64url(hexToBytes(point.x.toString(16))),
        y: bytesToBase64url(hexToBytes(point.y.toString(16))),
      } as JsonWebKey;
    }
    case 'Ed25519':
      return {
        alg: 'EdDSA',
        crv: 'Ed25519',
        kty: 'OKP',
        x: bytesToBase64url(rawPublicKeyBytes),
      } as JsonWebKey;
    default:
      throw new DIDKeyServiceError('Multicodec value not catch');
  }
}
