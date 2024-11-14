import { DIDDocument } from './did-key-service';
import { NotFoundError } from '../errors';
import logger from '../utils/logger';
import { saveKeys, saveDocumentDid, findDocumentDid } from '../repository';


export const getDIDDocument = async (
    didId: string
  ): Promise<{ document: DIDDocument }> => {
    logger.debug('Starting DID document retrieval process');
  
    const document = await findDocumentDid(didId);
    
    if (!document) {
      logger.error(`DID document not found for ID: ${didId}`);
      throw new NotFoundError('DID document not found');
    }
  
    logger.debug('DID document retrieved successfully');
    
    return { document };
  };
  
  export const saveDIDDocument = async (
    document: DIDDocument
  ): Promise<void> => {
    logger.debug('Starting DID document save process');
  
    await saveDocumentDid(document);
    
    logger.debug('DID document saved successfully');
  };
  
  export const saveKeyPair = async (
    publicKey: Uint8Array,
    privateKey: Uint8Array
  ): Promise<void> => {
    logger.debug('Starting key pair save process');
  
    await saveKeys(publicKey, privateKey);
    
    logger.debug('Key pair saved successfully');
  };