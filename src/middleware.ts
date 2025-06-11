import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '@/lib/auth';

// Middleware для защиты маршрутов
export async function middleware(request: NextRequest) {
  // Получение текущего пользователя из токена
  const user = await getCurrentUser();
  
  // Проверка аутентификации
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Требуется аутентификация' },
      { status: 401 }
    );
  }
  
  // Проверка прав доступа для административных маршрутов
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }
  }
  
  // Проверка прав доступа для маршрутов менеджера
  if (request.nextUrl.pathname.startsWith('/api/manager')) {
    if (!hasRole(user, 'admin') && !hasRole(user, 'manager')) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }
  }
  
  // Проверка прав доступа для маршрутов пайщика
  if (request.nextUrl.pathname.startsWith('/api/member')) {
    if (!hasRole(user, 'admin') && !hasRole(user, 'manager') && !hasRole(user, 'member')) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }
  }
  
  // Продолжение выполнения запроса
  return NextResponse.next();
}

// Конфигурация middleware - указываем, для каких маршрутов применять
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/manager/:path*',
    '/api/member/:path*',
    '/api/user/:path*'
  ]
};
