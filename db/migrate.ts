import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from 'fs/promises';
import * as path from 'path';
import 'dotenv/config';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  let retries = 5;
  while (retries > 0) {
    try {
      console.log('Attempting to connect to database...');
      const sql = postgres(connectionString, { 
        max: 1,
        connect_timeout: 10,
        idle_timeout: 10
      });

      console.log('Running migrations...');
      const migrationPath = path.join(process.cwd(), 'db', 'migrations', '0000_initial.sql');
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      
      await sql.unsafe(migrationSQL);
      console.log('Migrations completed successfully');
      await sql.end();
      return;
    } catch (error) {
      console.error(`Migration attempt failed (${retries} retries left):`, error);
      retries--;
      if (retries > 0) {
        console.log('Waiting 5 seconds before retrying...');
        await sleep(5000);
      }
    }
  }

  console.error('All migration attempts failed');
  process.exit(1);
};

// Run migrations with error handling
runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
