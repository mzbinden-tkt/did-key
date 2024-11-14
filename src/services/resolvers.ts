import { bytesToMultibase } from 'did-jwt';
import { DIDDocument, DIDDocumentOptions, createDIDDocument } from './did-key-service';
import { saveDIDDocument, saveKeyPair } from './did-document-service';
import { KeyGenerator, TKeyType } from './key-manager';
import logger from '../utils/logger';

const keyCodecs = {
  Ed25519: 'ed25519-pub',
  Secp256k1: 'secp256k1-pub',
} as const;
export const createDIDKey = async (
  typeKey: TKeyType,
  createKey: KeyGenerator,
  options?: DIDDocumentOptions
): Promise<{ document: DIDDocument }> => {
  logger.debug('Starting DID creation process');

  const keys = createKey();
  logger.debug('Key pair generated successfully');

  const multibase = bytesToMultibase(keys.public, 'base58btc', keyCodecs[typeKey]);

  const didDocument = createDIDDocument(`did:key:${multibase}`, options);

  await saveDIDDocument(didDocument);

  await saveKeyPair(keys.public, keys.private);

  return { document: didDocument };
};
