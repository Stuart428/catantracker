import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { pool } from './db';
import userRoutes from './api/user-routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Server is running' });
});

// Health check route
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: result.rows[0].now,
      message: 'Database connection successful' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed' 
    });
  }
});

// API routes
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received. Closing HTTP server and DB pool');
  pool.end();
  process.exit(0);
});
