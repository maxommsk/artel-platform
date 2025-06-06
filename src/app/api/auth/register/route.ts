import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { initDatabase } from '@/lib/db-postgres';

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
    // Инициализируем базу данных
    await initDatabase();

    const data = await request.json();
    const { username, email, password } = data;

    if (!username || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Все поля обязательны для заполнения' 
      }, { status: 400 });
    }

    // Проверяем существование пользователя
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE username = ${username} OR email = ${email}
      LIMIT 1
    `;

    if (existingUsers.rows.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Пользователь с таким именем или email уже существует' 
      }, { status: 409 });
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(password);

    // Получаем ID роли пользователя
    const userRole = await sql`
      SELECT id FROM roles WHERE name = 'user' LIMIT 1
    `;

    // Создаем пользователя
    const newUser = await sql`
      INSERT INTO users (username, email, password_hash, role_id)
      VALUES (${username}, ${email}, ${passwordHash}, ${userRole.rows[0].id})
      RETURNING id, username, email
    `;

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка при регистрации пользователя' 
    }, { status: 500 });
  }
}


