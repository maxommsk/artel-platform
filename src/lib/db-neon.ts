import 'dotenv/config';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


export async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Создаем таблицы если их нет
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        middle_name VARCHAR(100),
        role_id INTEGER REFERENCES roles(id),
        status VARCHAR(50) DEFAULT 'новичок',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'новичок'
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);

    // Добавляем базовые роли
    await client.query(`
      INSERT INTO roles (name, description) 
      VALUES ('user', 'Обычный пользователь'), ('admin', 'Администратор')
      ON CONFLICT (name) DO NOTHING
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Initialize tables on first import unless disabled
if (process.env.DB_INIT !== 'false') {
  initDatabase().catch((err) => {
    console.error('Database initialization error:', err);
  });
}

export async function createUser(userData: any) {
  const client = await pool.connect();
  try {
    const { username, email, password_hash, role_id } = userData;
    
    const result = await client.query(
      'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, password_hash, role_id]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function findUserByUsernameOrEmail(username: string, email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}
