import { BadRequestError } from '../../errors';

export class DIDKeyServiceError extends BadRequestError {
  constructor(message: string) {
    super(message);
    this.name = 'DIDKeyServiceError';
  }
}

export class InvalidDIDError extends DIDKeyServiceError {
  constructor(message: string = '') {
    super(`Invalid DID ${message}`);
  }
}

export class InvalidDIDFormatError extends DIDKeyServiceError {
  constructor(message: string = 'Invalid DID format') {
    super(message);
  }
}

export class InvalidPublicKeyTypeError extends DIDKeyServiceError {
  constructor() {
    super('Invalid public key type');
  }
}

export class UnsupportedPublicKeyType extends DIDKeyServiceError {
  constructor() {
    super('Unsupported public key type');
  }
}

export class InvalidPublicKeyLengthError extends DIDKeyServiceError {
  constructor() {
    super('Invalid public key length');
  }
}

export class InvalidDIDURLError extends DIDKeyServiceError {
  constructor() {
    super('Invalid DID URL');
  }
}

export class ValidationError extends DIDKeyServiceError {
  constructor(message: string = 'Validation failed') {
    super(message);
  }
}
