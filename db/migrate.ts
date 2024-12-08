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
  
  try {
    const sql = postgres(connectionString, { 
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const db = drizzle(sql);

    // Read and execute the SQL file directly
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '0000_initial.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    await sql.unsafe(migrationSQL);
    
    console.log('Migration completed successfully');
    await sql.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration().catch(console.error);
