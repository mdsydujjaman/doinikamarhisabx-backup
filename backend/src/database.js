import { MongoClient } from 'mongodb';

let client;
let database;
let connectionState = 'not_configured';

export function getDatabaseStatus() {
  return {
    ready: connectionState === 'connected' && Boolean(database),
    state: connectionState
  };
}

export function getDatabase() {
  if (!database || connectionState !== 'connected') {
    throw new Error('Database is not connected.');
  }

  return database;
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    connectionState = 'not_configured';
    console.warn('MongoDB is not configured; readiness will remain unavailable.');
    return false;
  }

  if (!dbName) {
    connectionState = 'not_configured';
    console.error('MONGODB_DB_NAME is missing.');
    return false;
  }

  connectionState = 'connecting';
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 0,
    retryReads: true,
    retryWrites: true
  });

  try {
    await client.connect();
    const selectedDatabase = client.db(dbName);
    await selectedDatabase.command({ ping: 1 });

    database = selectedDatabase;
    connectionState = 'connected';
    console.log('MongoDB connection verified successfully.');
    return true;
  } catch (error) {
    connectionState = 'connection_failed';
    console.error('MongoDB connection failed:', error.message);

    try {
      await client.close();
    } catch {
      // Preserve the original connection failure.
    }

    client = undefined;
    database = undefined;
    return false;
  }
}

export async function closeDatabase() {
  const currentClient = client;
  client = undefined;
  database = undefined;
  connectionState = 'disconnected';

  if (currentClient) {
    await currentClient.close();
  }
}
