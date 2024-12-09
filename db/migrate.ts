import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from 'fs/promises';
import * as path from 'path';
import 'dotenv/config';

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Running migrations...');
  console.log('Using connection string:', connectionString);
  
  try {
    const sql = postgres(connectionString, {
      max: 1,
      ssl: {
        rejectUnauthorized: false
      },
      idle_timeout: 20,
      connect_timeout: 10,
      keepalive: true,
      application_name: 'giftrove-migrations'
    });
    
    const db = drizzle(sql);

    // Read and execute the SQL file directly
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '0000_initial.sql');
    console.log('Reading migration file from:', migrationPath);
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('Executing migration SQL...');
    await sql.unsafe(migrationSQL);
    
    console.log('Migration completed successfully');
    await sql.end();
  } catch (error) {
    console.error('Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

runMigration().catch(console.error);
