import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { pool, initDatabase } from '@/lib/db-neon';

// Интерфейс для типизации тела запроса
interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
}

// Интерфейс для типизации пользователя
interface UserRecord {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
  password_hash?: string; // Сделано опциональным
  created_at: string;
  updated_at: string;
}

// Функция для создания мока базы данных
function createMockDb() {
  console.log('Using mock database in profile route');
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async <T = any>() => {
          // Для получения пользователя по ID
          if (query.includes('SELECT * FROM users WHERE id')) {
            return {
              results: [
                {
                  id: params[0],
                  username: 'user' + params[0],
                  email: `user${params[0]}@example.com`,
                  first_name: 'Максим',
                  last_name: 'Цветков',
                  middle_name: 'Юрьевич',
                  phone: '+79777707950',
                  password_hash:
                    '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ] as T[],
            };
          }
          return { results: [] as T[] };
        },
        run: async () => ({
          success: true,
          meta: { last_row_id: 1 },
        }),
      }),
    }),
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

    // Получаем данные из запроса с правильной типизацией
    const body = await request.json() as ProfileUpdateRequest;
    const { first_name, last_name, middle_name, phone } = body;

    // В режиме разработки/тестирования может использоваться мок
    const useMockDb = process.env.DB_MOCK === 'true';
    const hasD1 = Boolean((process.env as any).DB);

    // Проверяем, определена ли база для Cloudflare D1
    const db = hasD1 ? (process.env as any).DB as D1Database : null;

    if (!useMockDb && !hasD1) {
      // Если D1 недоступна, используем PostgreSQL через pool
      await initDatabase();
    }

    let updatedUser: UserRecord | undefined;

    if (useMockDb) {
      const dbMock = createMockDb();

      const { results } = await dbMock
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .all<UserRecord>();
      const user = results?.[0];
      if (!user) {
        return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
      }

      await dbMock.prepare(`
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

      const { results: updatedResults } = await dbMock
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .all<UserRecord>();
      updatedUser = updatedResults?.[0];
    } else if (hasD1 && db) {
      const { results } = await db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .all<UserRecord>();
      const user = results?.[0];
      if (!user) {
        return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
      }

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

      const { results: updatedResults } = await db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .all<UserRecord>();
      updatedUser = updatedResults?.[0];
    } else {
      // Используем PostgreSQL
      const { rows } = await pool.query<UserRecord>(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      const user = rows?.[0];
      if (!user) {
        return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
      }

      await pool.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, middle_name = $3, phone = $4, updated_at = NOW()
         WHERE id = $5`,
        [
          first_name || null,
          last_name || null,
          middle_name || null,
          phone || null,
          userId,
        ]
      );

      const { rows: updatedRows } = await pool.query<UserRecord>(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      updatedUser = updatedRows?.[0];
    }

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Ошибка при получении обновленных данных' }, { status: 500 });
    }

    // Создаем копию без чувствительных данных
    const userWithoutPassword: UserRecord = { ...updatedUser };
    
    // Удаляем пароль, если он есть
    if (userWithoutPassword.password_hash !== undefined) {
      delete userWithoutPassword.password_hash;
    }

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
