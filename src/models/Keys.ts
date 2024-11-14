export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  createdAt?: Date;
  updatedAt?: Date;
}
