import { ed25519 } from '@noble/curves/ed25519';

export function convertEd25519PublicKeyToX25519(publicKey: Uint8Array): Uint8Array {
  const Fp = ed25519.CURVE.Fp;
  const { y } = ed25519.ExtendedPoint.fromHex(publicKey);
  const _1n = BigInt(1);
  return Fp.toBytes(Fp.create((_1n + y) * Fp.inv(_1n - y)));
}
