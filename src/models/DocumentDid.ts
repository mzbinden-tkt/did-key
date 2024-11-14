export interface DocumentDid {
  '@context': string;
  id: string;
  publicKey: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyBase58: string;
  }>;
}
