import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
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
        role_id INTEGER REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

export async function findUserWithRole(username: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1 OR u.email = $1
      LIMIT 1
    `, [username]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getRoleByName(roleName: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id FROM roles WHERE name = $1 LIMIT 1',
      [roleName]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

