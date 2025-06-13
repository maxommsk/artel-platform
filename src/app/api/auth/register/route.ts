import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { initDatabase, createUser, findUserByUsernameOrEmail, getRoleByName } from '@/lib/db-neon';

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

    const data = await request.json() as { username: string; email: string; password: string };
    const { username, email, password } = data;

    if (!username || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Все поля обязательны для заполнения' 
      }, { status: 400 });
    }

    // Проверяем существование пользователя
    const existingUsers = await findUserByUsernameOrEmail(username, email);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const duplicateField = existingUser.username === username ? 'именем пользователя' : 'email';
      return NextResponse.json({ 
        success: false, 
        message: `Пользователь с таким ${duplicateField} уже существует` 
      }, { status: 409 });
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(password);

    // Получаем ID роли пользователя
    const userRole = await getRoleByName('user');

    // Создаем пользователя
    const newUser = await createUser({
      username,
      email,
      password_hash: passwordHash,
      role_id: userRole.id
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка при регистрации пользователя' 
    }, { status: 500 });
  }
}
