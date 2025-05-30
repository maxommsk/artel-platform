import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Функция для создания мока базы данных
function createMockDb() {
  console.log('Using mock database in profile route');
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          // Для получения пользователя по ID
          if (query.includes('SELECT * FROM users WHERE id')) {
            return { 
              results: [{ 
                id: params[0], 
                username: 'user' + params[0],
                email: `user${params[0]}@example.com`,
                first_name: 'Максим',
                last_name: 'Цветков',
                middle_name: 'Юрьевич',
                phone: '+79777707950',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }] 
            };
          }
          return { results: [] };
        },
        run: async () => ({ 
          success: true, 
          meta: { last_row_id: 1 }
        })
      })
    })
  };
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Требуется авторизация' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: number;

    try {
      const decoded = await verifyToken(token);
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ success: false, message: 'Недействительный токен' }, { status: 401 });
    }

    // Получаем данные из запроса
    const body = await request.json();
    const { first_name, last_name, middle_name, phone } = body;

    // Используем мок базы данных в продакшене или реальную базу данных в других окружениях
    const useMockDb = process.env.DB_MOCK === 'true';
    const db = useMockDb 
      ? createMockDb() 
      : (process.env as any).DB as D1Database;

    if (!db) throw new Error('База данных не найдена!');

    // Проверяем существование пользователя
    const { results } = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all();

    const user = results?.[0];
    if (!user) {
      return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
    }

    // Обновляем профиль пользователя
    await db.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, middle_name = ?, phone = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      first_name || null,
      last_name || null,
      middle_name || null,
      phone || null,
      new Date().toISOString(),
      userId
    ).run();

    // Получаем обновленные данные пользователя
    const { results: updatedResults } = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all();

    const updatedUser = updatedResults?.[0];
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Ошибка при получении обновленных данных' }, { status: 500 });
    }

    // Удаляем чувствительные данные из ответа
    const { password_hash: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('🔥 Ошибка в /api/auth/profile:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Ошибка сервера' }, { status: 500 });
  }
}

