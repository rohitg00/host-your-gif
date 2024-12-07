import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runMigration = async () => {
  // Use connection string for more reliable connection
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  let retries = 5;
  let lastError: any;

  while (retries > 0) {
    try {
      console.log('Attempting to connect to database...');
      
      // Create connection with minimal configuration
      const sql = postgres(connectionString, {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
        ssl: true, // Use default SSL configuration
      });

      console.log('Running migrations...');
      const migrationPath = path.join(process.cwd(), 'db', 'migrations', '0000_initial.sql');
      console.log('Looking for migration file at:', migrationPath);
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      
      await sql.unsafe(migrationSQL);
      console.log('Migrations completed successfully');
      await sql.end();
      return;
    } catch (error) {
      lastError = error;
      console.error(`Migration attempt failed (${retries} retries left):`, error);
      retries--;
      if (retries > 0) {
        const waitTime = (6 - retries) * 10000;
        console.log(`Waiting ${waitTime/1000} seconds before retrying...`);
        await sleep(waitTime);
      }
    }
  }

  throw new Error(`All migration attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Run migrations if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch((err) => {
    console.error('Fatal migration error:', err);
    process.exit(1);
  });
}
