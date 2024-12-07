import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@db/schema";

// Construct connection config from individual parts
const dbConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
};

if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error(
    "Database configuration is incomplete. Check your environment variables.",
  );
}

const client = postgres({
  ...dbConfig,
  max: 10,
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

export const db = drizzle(client, { schema });
