import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as path from 'path';
import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('Running migrations...');
  
  try {
    // Use drizzle-orm's migrate function
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'db', 'migrations'),
    });
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  await sql.end();
  process.exit(0);
}

runMigration().catch(console.error);
