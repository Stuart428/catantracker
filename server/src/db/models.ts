
// User model interface
export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

// Post model interface
export interface Post {
  id?: number;
  title: string;
  content: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

// Comment model interface
export interface Comment {
  id?: number;
  content: string;
  user_id: number;
  post_id: number;
  created_at?: Date;
}
