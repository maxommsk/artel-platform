import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { User } from '@/lib/models';
import { createMockDb } from '@/lib/mocks/mockDb';


export async function POST(request: NextRequest) {
  try {
    interface LoginRequestBody {
      username: string;
      password: string;
    }

    const body = await request.json() as LoginRequestBody;
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Заполните все поля' }, { status: 400 });
    }

    // Используем мок базы данных в продакшене или реальную базу данных в других окружениях
    const useMockDb = process.env.DB_MOCK === 'true';
    const db = useMockDb 
      ? createMockDb() 
      : (process.env as any).DB as D1Database;

    if (!db) throw new Error('База данных не найдена!');

    const { results } = await db.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).all();

    const user = results?.[0];
    if (!user) {
      return NextResponse.json({ success: false, message: 'Неверный логин или пароль' }, { status: 401 });
    }

    // В режиме мока пропускаем проверку пароля
    let passwordMatch = false;
    if (useMockDb) {
      passwordMatch = true;
      console.log('Mock mode: skipping password verification');
    } else {
      passwordMatch = await verifyPassword(password, (user as any).password_hash as string);
    }

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: 'Неверный логин или пароль' }, { status: 401 });
    }

    const { results: roles } = await db.prepare(`
      SELECT r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `).bind((user as any).id).all();

    const roleNames = roles.map(r => (r as any).name);
    const token = await createToken(
      { 
        id: (user as any).id as number, 
        username: (user as any).username as string, 
        roles: [
          roleNames.length > 0 
            ? { id: 1, name: roleNames[0] as string } 
            : { id: 1, name: 'user' }
        ]
      }, 
      roleNames as string[]
    );
    
    await setAuthCookie(token);

    const { password_hash: _, ...userWithoutPassword } = user as any;

    return NextResponse.json({
      success: true,
      message: 'Успешный вход',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('🔥 Ошибка в /api/auth/login:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Ошибка сервера' }, { status: 500 });
  }
}

