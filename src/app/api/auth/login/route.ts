import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { sql } from '@vercel/postgres';

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
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Логин и пароль обязательны' 
      }, { status: 400 });
    }

    // Ищем пользователя по username или email
    const userResult = await sql`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = ${username} OR u.email = ${username}
      LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Неверный логин или пароль' 
      }, { status: 401 });
    }

    const user = userResult.rows[0];

    // Проверяем пароль
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ 
        success: false, 
        message: 'Неверный логин или пароль' 
      }, { status: 401 });
    }

    // Создаем токен
    const token = await createToken(
      { 
        id: user.id, 
        username: user.username, 
        roles: [user.role_name] 
      },
      [user.role_name]
    );

    // Устанавливаем cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Успешный вход в систему',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка при входе в систему' 
    }, { status: 500 });
  }
}


