
import { Pool, QueryResult } from 'pg';
import { User, Post, Comment } from './models';

export class DatabaseRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // User operations
  async createUser(user: User): Promise<User> {
    const { username, email, password_hash } = user;
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [username, email, password_hash]);
    return result.rows[0];
  }

  async getUserById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await this.pool.query(query, [username]);
    return result.rows.length ? result.rows[0] : null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const keys = Object.keys(updates).filter(key => key !== 'id' && updates[key as keyof User] !== undefined);
    
    if (keys.length === 0) return null;
    
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = keys.map(key => updates[key as keyof User]);
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [id, ...values]);
    return result.rows.length ? result.rows[0] : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Post operations
  async createPost(post: Post): Promise<Post> {
    const { title, content, user_id } = post;
    const query = `
      INSERT INTO posts (title, content, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [title, content, user_id]);
    return result.rows[0];
  }

  async getPostById(id: number): Promise<Post | null> {
    const query = 'SELECT * FROM posts WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  async getPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await this.pool.query(query, [limit, offset]);
    return result.rows;
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    const query = 'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | null> {
    const keys = Object.keys(updates).filter(key => 
      key !== 'id' && key !== 'user_id' && updates[key as keyof Post] !== undefined
    );
    
    if (keys.length === 0) return null;
    
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = keys.map(key => updates[key as keyof Post]);
    
    const query = `
      UPDATE posts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [id, ...values]);
    return result.rows.length ? result.rows[0] : null;
  }

  async deletePost(id: number): Promise<boolean> {
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Comment operations
  async createComment(comment: Comment): Promise<Comment> {
    const { content, user_id, post_id } = comment;
    const query = `
      INSERT INTO comments (content, user_id, post_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [content, user_id, post_id]);
    return result.rows[0];
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const query = 'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC';
    const result = await this.pool.query(query, [postId]);
    return result.rows;
  }

  async deleteComment(id: number): Promise<boolean> {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Transaction helper
  async executeTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
