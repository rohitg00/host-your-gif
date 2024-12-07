import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runMigration = async () => {
  // Construct connection string from individual parts for more control
  const dbConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
  };

  let retries = 5;
  let lastError: any;

  while (retries > 0) {
    try {
      console.log('Attempting to connect to database...');
      console.log(`Connecting to ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
      
      const sql = postgres({
        ...dbConfig,
        max: 1,
        connect_timeout: 60,
        idle_timeout: 60,
        ssl: {
          rejectUnauthorized: false,
          requestCert: true
        },
        transform: {
          undefined: null,
        }
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
        const waitTime = (6 - retries) * 10000; // Longer wait times
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
