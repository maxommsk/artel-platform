import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { User } from '@/lib/models';

// Определяем интерфейс для пользователя в моке
interface MockUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Интерфейс для роли
interface Role {
  name: string;
}

// Функция для создания мока базы данных с реальной проверкой учетных данных
function createMockDb() {
  console.log('Using enhanced mock database in login route');
  
  // Хранилище пользователей для мока
  // В реальном приложении это должно быть заменено на настоящую базу данных
  const mockUsers: MockUser[] = [
    { 
      id: 1, 
      username: 'maxommsk@gmail.com', 
      email: 'maxommsk@gmail.com',
      password_hash: '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K', // хеш для пароля "password"
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 2, 
      username: 'maxi_trade@mail.ru', 
      email: 'maxi_trade@mail.ru',
      password_hash: '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K', // хеш для пароля "password"
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    // Здесь можно добавить других пользователей для тестирования
  ];
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          // Для проверки пользователя по имени/email
          if (query.includes('SELECT * FROM users WHERE username')) {
            const username = params[0];
            console.log(`Searching for user with username: ${username}`);
            
            // Ищем пользователя по username или email
            const user = mockUsers.find(u => 
              u.username.toLowerCase() === username.toLowerCase() || 
              u.email.toLowerCase() === username.toLowerCase()
            );
            
            if (user) {
              console.log(`User found: ${user.username}`);
              return { results: [user] };
            } else {
              console.log('User not found');
              return { results: [] };
            }
          }
          
          // Для получения ролей
          if (query.includes('SELECT r.name FROM roles')) {
            const userId = params[0];
            console.log(`Getting roles for user ID: ${userId}`);
            
            // В моке у всех пользователей роль 'user'
            // В реальном приложении здесь должна быть логика получения ролей из БД
            return { results: [{ name: 'user' }] };
          }
          
          return { results: [] };
        }
      })
    })
  };
}

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

    // Проверяем, что у пользователя есть поле password_hash
    if (!('password_hash' in user)) {
      return NextResponse.json({ success: false, message: 'Ошибка данных пользователя' }, { status: 500 });
    }
    
    // В реальном приложении всегда используйте verifyPassword
    // Для тестирования можно временно использовать проверку на "password"
    const passwordMatch = await verifyPassword(password, user.password_hash as string);

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: 'Неверный логин или пароль' }, { status: 401 });
    }

    const { results: rolesResults } = await db.prepare(`
      SELECT r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `).bind(user.id).all();

    // Убедимся, что все элементы в массиве имеют поле name
    const roles: Role[] = rolesResults.filter((r): r is Role => 'name' in r);
    const roleNames = roles.map(r => r.name);
    
    // Создаем токен только с полями, которые ожидает функция createToken
    const tokenPayload = {
      id: user.id as number,
      username: user.username as string,
      roles: [
        roleNames.length > 0 
          ? { id: 1, name: roleNames[0] as string } 
          : { id: 1, name: 'user' }
      ]
    };
    
    const token = await createToken(tokenPayload, roleNames as string[]);
    
    await setAuthCookie(token);

    // Безопасно удаляем пароль из объекта пользователя
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password_hash;

    // Добавляем email в ответ, чтобы он был доступен на клиенте
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

