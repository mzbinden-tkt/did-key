import { bytesToMultibase, multibaseToBytes } from 'did-jwt';
import logger from '../../utils/logger';
import {
  DIDKeyServiceError,
  InvalidDIDError,
  InvalidDIDURLError,
  InvalidPublicKeyLengthError,
  InvalidPublicKeyTypeError,
  UnsupportedPublicKeyType,
} from './errors';
import {
  DIDDocument,
  DIDDocumentOptions,
  VerificationMethod,
  VerificationMethodTypes,
} from './types';
import { createJWK } from './jwk';
import { convertEd25519PublicKeyToX25519 } from './converts';
import {
  isSupportedKeyFormat,
  isValidDID,
  isValidDIDURL,
  isValidatePublicKeyLength,
  validateIdentifier,
} from './validators';

const DEFAULT_OPTIONS: DIDDocumentOptions = {
  publicKeyFormat: VerificationMethodTypes.JsonWebKey2020,
  enableExperimentalPublicKeyTypes: false,
  defaultContext: [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/ed25519-2020/v1',
    'https://w3id.org/security/suites/x25519-2020/v1',
  ],
};

export function createDIDDocument(
  identifier: string,
  options: DIDDocumentOptions = {} as DIDDocumentOptions
): DIDDocument {
  logger.debug('Starting DID document creation process');

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  if (!isValidDID(identifier)) {
    throw new InvalidDIDError();
  }

  const document: DIDDocument = {
    '@context': mergedOptions.defaultContext!,
    id: identifier,
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    capabilityDelegation: [],
    capabilityInvocation: [],
    keyAgreement: [],
  };

  const [scheme, method, version, multibaseValue] = parseIdentifier(identifier);
  validateIdentifier(scheme, method, version, multibaseValue);

  if (!mergedOptions.publicKeyFormat || !isSupportedKeyFormat(mergedOptions.publicKeyFormat)) {
    throw new UnsupportedPublicKeyType();
  }

  if (
    !mergedOptions.enableExperimentalPublicKeyTypes &&
    !isSupportedKeyFormat(mergedOptions.publicKeyFormat)
  ) {
    throw new InvalidPublicKeyTypeError();
  }

  const signatureVerificationMethod = createSignature(
    identifier,
    multibaseValue,
    mergedOptions.publicKeyFormat!
  );
  document.verificationMethod = [signatureVerificationMethod];

  const verificationMethodId = signatureVerificationMethod.id;
  document.authentication = [verificationMethodId];
  document.assertionMethod = [verificationMethodId];
  document.capabilityInvocation = [verificationMethodId];
  document.capabilityDelegation = [verificationMethodId];

  if (mergedOptions.enableEncryptionKeyDerivation) {
    const encryptedVerificationMethod = createEncryptionMethod(
      identifier,
      multibaseValue,
      mergedOptions.publicKeyFormat!
    );
    document.keyAgreement = [encryptedVerificationMethod];
  }

  logger.debug('DID document created successfully');

  return document;
}

function parseIdentifier(identifier: string): string[] {
  const parts = identifier.split(':');
  if (parts.length === 3) {
    return [parts[0], parts[1], '1', parts[2]];
  }
  return parts;
}

function createSignature(
  identifier: string,
  multibaseValue: string,
  publicKeyFormat: VerificationMethodTypes
): VerificationMethod {
  const verificationMethod: VerificationMethod = {} as VerificationMethod;

  const { keyBytes: rawPublicKeyBytes, keyType: multicodecValue } =
    multibaseToBytes(multibaseValue);

  if (!multicodecValue || !isValidatePublicKeyLength(multicodecValue, rawPublicKeyBytes)) {
    throw new InvalidPublicKeyLengthError();
  }

  const id = `${identifier}#${multibaseValue}`;
  if (!isValidDIDURL(id)) {
    throw new InvalidDIDURLError();
  }

  verificationMethod.id = id;
  verificationMethod.type = publicKeyFormat;
  verificationMethod.controller = identifier;

  switch (publicKeyFormat) {
    case VerificationMethodTypes.Multikey:
    case VerificationMethodTypes.Ed25519VerificationKey2020:
      verificationMethod.publicKeyMultibase = multibaseValue;
      break;
    case VerificationMethodTypes.JsonWebKey2020:
      verificationMethod.publicKeyJwk = createJWK(multicodecValue, rawPublicKeyBytes);
      break;
    default:
      throw new DIDKeyServiceError('Verification method not catch');
  }

  return verificationMethod;
}

function createEncryptionMethod(
  identifier: string,
  multibaseValue: string,
  publicKeyFormat: VerificationMethodTypes
): VerificationMethod {
  const { keyBytes: rawPublicKeyBytes, keyType: multicodecValue } =
    multibaseToBytes(multibaseValue);

  if (!multicodecValue || multicodecValue === 'X25519' || rawPublicKeyBytes.length !== 32) {
    throw new InvalidPublicKeyLengthError();
  }

  const encryptionKeyBytes = convertEd25519PublicKeyToX25519(rawPublicKeyBytes);

  const encryptionKeyMultibase = bytesToMultibase(encryptionKeyBytes, 'base58btc', 'x25519-pub');

  const id = `${identifier}#${encryptionKeyMultibase}`;
  if (!isValidDIDURL(id)) {
    throw new InvalidDIDURLError();
  }

  const verificationMethod: VerificationMethod = {
    id,
    type: publicKeyFormat,
    controller: identifier,
  };

  switch (publicKeyFormat) {
    case VerificationMethodTypes.Multikey:
    case VerificationMethodTypes.Ed25519VerificationKey2020:
      verificationMethod.publicKeyMultibase = multibaseValue;
      break;
    case VerificationMethodTypes.JsonWebKey2020:
      verificationMethod.publicKeyJwk = createJWK(multicodecValue, encryptionKeyBytes);
      break;
    default:
      throw new DIDKeyServiceError('Verification method not catch');
  }

  return verificationMethod;
}
