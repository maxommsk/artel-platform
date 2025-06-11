import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

// Обработчик выхода пользователя
export async function POST(request: NextRequest) {
  try {
    // Очистка куки с токеном аутентификации
    await clearAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
    
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
