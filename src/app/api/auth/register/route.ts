import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { User, UserCreateInput } from '@/lib/models';
import { createMockDb } from '@/lib/mocks/mockDb';

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
    const data = await request.json() as {
  username: string;
  email: string;
  password: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
};
    console.log('📥 Полученные данные:', data);

    if (!data.username || !data.email || !data.password) {
      return NextResponse.json({ success: false, message: 'Не указаны обязательные поля' }, { status: 400 });
    }

    // Используем мок базы данных в продакшене или реальную базу данных в других окружениях
    const useMockDb = process.env.DB_MOCK === 'true';
    const db = useMockDb 
      ? createMockDb() 
      : (process.env as any).DB as D1Database;

    if (!db) throw new Error('База данных не найдена!');

    const { results: existingUsers } = await db.prepare(
  'SELECT * FROM users WHERE username = ? OR email = ?'
).bind(data.username, data.email).all();

console.log('Проверка существования пользователя:', { 
  existingUsers, 
  length: (existingUsers as any).length,
  isArray: Array.isArray(existingUsers),
  type: typeof existingUsers
});

if ((existingUsers as any).length > 0) {
  const existingUser = (existingUsers as any)[0];
  const duplicateField = existingUser.username === data.username ? 'именем пользователя' : 'email';
  return NextResponse.json({ 
    success: false, 
    message: `Пользователь с таким ${duplicateField} уже существует` 
  }, { status: 409 });
}

    const password_hash = await hashPassword(data.password);
    const userInput: UserCreateInput = {
      username: data.username,
      email: data.email,
      password_hash,
      phone: data.phone,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
    };

    const insertUser = await db.prepare(`
      INSERT INTO users (username, email, password_hash, phone, first_name, last_name, middle_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userInput.username,
      userInput.email,
      userInput.password_hash,
      userInput.phone || null,
      userInput.first_name || null,
      userInput.last_name || null,
      userInput.middle_name || null
    ).run();

    const userId = insertUser.meta?.last_row_id;

    await db.prepare(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT ?, id FROM roles WHERE name = 'user'
    `).bind(userId).run();

    const { results: userRows } = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all();

    const newUser = (userRows as any)[0];
    if (!newUser) {
      return NextResponse.json({ success: false, message: 'Ошибка при создании пользователя' }, { status: 500 });
    }

    const { results: roles } = await db.prepare(`
      SELECT r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `).bind(userId).all();

    const roleNames = roles.map(r => (r as any).name);
    const token = await createToken({ 
      id: newUser.id as number, 
      username: newUser.username as string, 
      roles: [
        roleNames.length > 0 
          ? { id: 1, name: roleNames[0] as string } 
          : { id: 1, name: 'user' }
      ]
    }, roleNames as string[]);
 
    setAuthCookie(token);

    const { password_hash: _, ...userWithoutPassword } = newUser as any;

    return NextResponse.json({
      success: true,
      message: 'Регистрация успешно завершена',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('🔥 Ошибка в /api/auth/register:', error);
    return NextResponse.json({
      success: false,
      message: error?.message || 'Что-то пошло не так',
    }, { status: 400 });
  }
}

