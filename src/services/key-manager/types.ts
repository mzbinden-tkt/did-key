export type TKeyType = 'Ed25519' | 'Secp256k1';

export type KeyGenerator = () => KeysInfo;

export interface KeysInfo {
  public: Uint8Array;
  private: Uint8Array;
}
