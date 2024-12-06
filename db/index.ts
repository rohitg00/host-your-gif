import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function createDbConnection(retryCount = 0): Promise<postgres.Sql> {
  try {
    console.log('Attempting to connect to database...');
    const client = postgres(process.env.DATABASE_URL!, {
      max: 10, // Max pool size
      idle_timeout: 20, // Idle connection timeout in seconds
      connect_timeout: 10, // Connection timeout in seconds
    });
    
    // Test the connection
    await client`SELECT 1`;
    console.log('Successfully connected to database');
    return client;
  } catch (error) {
    console.error(`Database connection attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return createDbConnection(retryCount + 1);
    }
    
    throw new Error(`Failed to connect to database after ${MAX_RETRIES} attempts`);
  }
}

let client: postgres.Sql;

export const initDb = async () => {
  client = await createDbConnection();
  return drizzle(client, { schema });
};

export const getDb = () => {
  if (!client) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return drizzle(client, { schema });
};

// For backwards compatibility
export const db = drizzle(postgres(process.env.DATABASE_URL!), { schema });
