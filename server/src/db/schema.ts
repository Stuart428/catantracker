
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Schema deployment function
export async function deploySchema(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query('COMMIT');
    console.log('Database schema deployed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deploying schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to drop all tables (for testing/reset)
export async function dropSchema(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS comments CASCADE');
    await client.query('DROP TABLE IF EXISTS posts CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('COMMIT');
    console.log('Schema dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error dropping schema:', error);
    throw error;
  } finally {
    client.release();
  }
}
