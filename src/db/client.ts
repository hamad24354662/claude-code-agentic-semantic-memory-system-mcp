import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables - try both local and project root
dotenv.config({ path: path.join(__dirname, '../../.env') });
if (!process.env.DATABASE_URL) {
  // If not found, try the project root
  dotenv.config({ path: path.join(__dirname, '../../../../.env') });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is required. Please set it in your .env file.'
  );
}

// Create the Neon connection
const sql = neon(databaseUrl);

// Create the Drizzle client
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export { schema };