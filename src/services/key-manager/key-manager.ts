import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { TKeyType, KeysInfo, KeyGenerator } from './types';

const ed25519KeyGenerator: KeyGenerator = (): KeysInfo => {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.utils.getExtendedPublicKey(privateKey).pointBytes;
  return { public: publicKey, private: privateKey };
};

const secp256k1KeyGenerator: KeyGenerator = (): KeysInfo => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);
  return { public: publicKey, private: privateKey };
};

const keyGenerators: Record<TKeyType, KeyGenerator> = {
  Ed25519: ed25519KeyGenerator,
  Secp256k1: secp256k1KeyGenerator,
};

export function getGeneratorKey({ type }: { type: TKeyType }): KeyGenerator {
  const keyGenerator = keyGenerators[type];
  if (!keyGenerator) {
    throw new Error('not_supported: Key type not supported: ' + type);
  }

  return keyGenerator;
}
