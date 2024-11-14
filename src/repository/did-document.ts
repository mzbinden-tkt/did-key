import { Collection } from 'mongodb';
import { BadRequestError } from '../errors';
import { DIDDocument } from '../services/did-key-service';
import { getDatabase } from './client';

const dbName = 'code-challenge';
const collectionName = 'didDocuments';

const getCollection = (): Collection<DIDDocument> => {
  const db = getDatabase(dbName);
  return db.collection<DIDDocument>(collectionName);
};

export const findDocumentDid = async (didID: string): Promise<DIDDocument | null> => {
  try {
    if (!didID) {
      throw new BadRequestError('DID is required');
    }

    const collection = getCollection();
    const results = await collection.find({ id: didID }).toArray();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error: unknown) {
    throw error;
  }
};

export const saveDocumentDid = async (documentDID: DIDDocument): Promise<void> => {
  try {
    const collection = getCollection();

    await collection.insertOne(documentDID);
  } catch (error: unknown) {
    throw error;
  }
};
