export type KNOWN_KEY_TYPE =
  | 'Secp256k1'
  | 'Ed25519'
  | 'X25519'
  | 'Bls12381G1'
  | 'Bls12381G2'
  | 'P-256';

export enum VerificationMethodTypes {
  JsonWebKey2020 = 'JsonWebKey2020',
  Ed25519VerificationKey2020 = 'Ed25519VerificationKey2020',
  Multikey = 'Multikey',
}

export interface VerificationMethod {
  id: string;
  type: VerificationMethodTypes;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: JsonWebKey;
}

export interface DIDDocument {
  '@context': string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
  keyAgreement: VerificationMethod[];
}

export interface DIDDocumentOptions {
  publicKeyFormat?: VerificationMethodTypes;
  enableExperimentalPublicKeyTypes?: boolean;
  defaultContext?: string[];
  enableEncryptionKeyDerivation?: boolean;
}
