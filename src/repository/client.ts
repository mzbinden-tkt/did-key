import { MongoClient } from 'mongodb';
import logger from '../utils/logger';

const uri = 'mongodb://localhost:27017/didDatabase';
const options = {
  maxPoolSize: 10,
};

const client = new MongoClient(uri, options);

export const getDatabase = (dbName: string) => {
  return client.db(dbName);
};

export const connectClient = async () => {
  try {
    await client.db().command({ ping: 1 });
    logger.debug('MongoDB connection successful');
  } catch {
    await client.connect();
    logger.debug('New MongoDB connection established successfully');
  }
};

export const disconnectClient = async () => {
  try {
    await client.db().command({ ping: 1 });
  } catch {
    await client.close();
  }
};
