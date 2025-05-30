import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Используем тот же секретный ключ, что и в lib/auth.ts
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'znk-artel-secret-key');

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('Authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Убираем 'Bearer ' из начала
    } else {
      // Если токен не найден в заголовке, пробуем получить из cookie
      const cookies = request.cookies;
      const authCookie = cookies.get('auth_token');
      if (authCookie) {
        token = authCookie.value;
      }
    }

    // Если токен не найден, возвращаем ошибку
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Токен авторизации не найден' },
        { status: 401 }
      );
    }

    // Проверяем токен с использованием jose (как в lib/auth.ts)
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Возвращаем успешный ответ с данными пользователя
    return NextResponse.json({
      success: true,
      message: 'Токен действителен',
      user: payload
    });
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    
    // Если токен недействителен или истек срок действия
    return NextResponse.json(
      { success: false, message: 'Недействительный или просроченный токен' },
      { status: 401 }
    );
  }
}

