
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { DatabaseRepository } from './repository';
import { deploySchema, dropSchema } from './schema';

// Initialize environment variables
dotenv.config();

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Recommended settings for Replit
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Create repository instance
const db = new DatabaseRepository(pool);

// Export database utilities
export {
  pool,
  db,
  deploySchema,
  dropSchema
};

// Add graceful shutdown
process.on('SIGINT', () => {
  pool.end();
  console.log('Database pool has ended');
  process.exit(0);
});
