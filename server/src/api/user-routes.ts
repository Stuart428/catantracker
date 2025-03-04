
import express, { Request, Response } from 'express';
import { db } from '../db';
import { User } from '../db/models';

const router = express.Router();

// Get all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await db.pool.query('SELECT id, username, email, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = await db.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't return password hash
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email, password_hash } = req.body;
    
    if (!username || !email || !password_hash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newUser = await db.createUser({ username, email, password_hash });
    
    // Don't return password hash
    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key error
    if ((error as any).code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Partial<User> = req.body;
    
    // Prevent updating id
    delete updates.id;
    
    const updatedUser = await db.updateUser(id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't return password hash
    const { password_hash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
