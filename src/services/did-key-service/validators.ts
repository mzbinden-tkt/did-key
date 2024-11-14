import { InvalidDIDError } from './errors';
import { KNOWN_KEY_TYPE, VerificationMethodTypes } from './types';
import { parse } from 'did-resolver'

export function isSupportedKeyFormat(format: VerificationMethodTypes): boolean {
  return [
    VerificationMethodTypes.Multikey,
    VerificationMethodTypes.JsonWebKey2020,
    VerificationMethodTypes.Ed25519VerificationKey2020,
  ].includes(format);
}

export function isValidatePublicKeyLength(
  multicodecValue: KNOWN_KEY_TYPE,
  rawPublicKeyBytes: Uint8Array
): boolean {
  const expectedLengths: Partial<Record<KNOWN_KEY_TYPE, number>> = {
    Secp256k1: 33,
    Ed25519: 32,
  };

  return rawPublicKeyBytes.length == expectedLengths[multicodecValue];
}

export function isValidDID(did: string): boolean {
  try {
    parse(did)
    return true
  } catch (error) {
    return false
  }
}

export function isValidDIDURL(url: string): boolean {
  const didUrlRegex = /^did:[a-z0-9]+:[a-zA-Z0-9.%-]+#[a-zA-Z0-9_.-]+$/;
  return didUrlRegex.test(url);
}

export function validateIdentifier(
  scheme: string,
  method: string,
  version: string,
  multibaseValue: string
): void {
  if (scheme !== 'did') throw new InvalidDIDError('scheme');
  if (method !== 'key') throw new InvalidDIDError('method');
  if (!Number.isInteger(Number(version)) || Number(version) <= 0)
    throw new InvalidDIDError('version');
  if (!multibaseValue?.startsWith('z')) throw new InvalidDIDError('multibase value');
}
