import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { pool, initDatabase } from '@/lib/db-neon';

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
    await initDatabase();
    const { username, password } = await request.json() as { username: string; password: string };

    const useMockDb = process.env.DB_MOCK === 'true';

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Логин и пароль обязательны' }, { status: 400 });
    }

    let user: any | undefined;
    if (useMockDb) {
      const { results } = await createMockDb()
        .prepare(
          `SELECT * FROM users WHERE username = ? OR email = ?`
        )
        .bind(username, username)
        .all();
      user = results[0];
    } else {
      const { rows } = await pool.query(
        `SELECT u.*, r.name as role_name
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.username = $1 OR u.email = $1
         LIMIT 1`,
        [username]
      );
      user = rows[0];
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Неверный логин или пароль' }, { status: 401 });
    }



    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: 'Неверный логин или пароль' }, { status: 401 });
    }

    const token = await createToken(
      { id: user.id, username: user.username, roles: [user.role_name] },
      [user.role_name]
    );
    await setAuthCookie(token);

    const { password_hash, role_name, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Успешный вход в систему',
      user: { ...userWithoutPassword, role: role_name },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка при входе в систему' }, { status: 500 });
  }
}

