import { Collection } from 'mongodb';
import { BadRequestError } from '../errors';
import { KeyPair } from '../models/Keys';
import { getDatabase } from './client';

//PREFERRED SAVED IN DEDICATED STORAGE
const dbName = 'code-challenge';
const collectionName = 'keys';

const getCollection = (): Collection<KeyPair> => {
  const db = getDatabase(dbName);
  return db.collection<KeyPair>(collectionName);
};

export const saveKeys = async (publicKey: Uint8Array, privateKey: Uint8Array): Promise<void> => {
  try {
    const collection = getCollection();

    if (!publicKey || !privateKey) {
      throw new BadRequestError('Public or private key is missing');
    }

    const documentToInsert: KeyPair = {
      publicKey: publicKey,
      privateKey: privateKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(documentToInsert);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Error saving metadata DID: ${errorMessage}`);
  }
};
