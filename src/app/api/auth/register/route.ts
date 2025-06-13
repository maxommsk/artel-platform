import { NextRequest, NextResponse } from 'next/server';
import { pool, initDatabase } from '@/lib/db-neon';
import {
  hashPassword,
  createToken,
  setAuthCookie
} from '@/lib/auth';
import type { User, UserCreateInput } from '@/lib/models';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
}

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const data: RegisterData = await request.json();

    if (!data.username || !data.email || !data.password) {
      return NextResponse.json(
        { success: false, message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    const { rows: existing } = await pool.query<User>(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [data.username, data.email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Пользователь с таким именем или email уже существует' },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(data.password);

    const userInput: UserCreateInput = {
      username: data.username,
      email: data.email,
      password_hash,
      phone: data.phone,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name
    };

    const { rows: inserted } = await pool.query<{ id: number }>(
      `INSERT INTO users (username, email, password_hash, phone, first_name, last_name, middle_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        userInput.username,
        userInput.email,
        userInput.password_hash,
        userInput.phone || null,
        userInput.first_name || null,
        userInput.last_name || null,
        userInput.middle_name || null
      ]
    );
    const userId = inserted[0].id;

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = 'user'`,
      [userId]
    );

    const { rows } = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    const newUser = rows[0];
    if (!newUser) {
      return NextResponse.json({ success: false, message: 'Ошибка при создании пользователя' }, { status: 500 });
    }

    const { rows: roleRows } = await pool.query<{ name: string }>(
      `SELECT r.name FROM roles r
         JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = $1`,
      [userId]
    );

    const roleNames = roleRows.map(r => r.name);
    const token = await createToken(newUser, roleNames);
    await setAuthCookie(token);

    const { password_hash: _ph, ...userWithoutPassword } = newUser as any;

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при регистрации пользователя' },
      { status: 500 }
    );
  }
}

