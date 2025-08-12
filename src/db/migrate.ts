import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is required. Please set it in your .env file.'
  );
}

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    const sql = neon(databaseUrl);
    const db = drizzle(sql);
    
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();