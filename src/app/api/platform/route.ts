// Конфигурация для развертывания платформы
import { NextRequest, NextResponse } from 'next/server';
import { withRoleCheck, AccessRequirements } from '@/lib/rbac';

// Получение информации о статусе платформы
export async function GET(request: NextRequest) {
  try {
    const platformInfo = {
      name: 'ЖНК "Артель"',
      version: '1.0.0',
      status: 'active',
      features: [
        'Система членства и распределения жилья',
        'Токенизация паевых взносов через ЦФА "Метр Кубический"',
        'Децентрализованное хранение данных',
        'Калькулятор точки ускорения',
        'Дорожная карта накопления',
        'Электронный документооборот',
        'Блокчейн-интеграция'
      ],
      components: {
        frontend: 'Next.js',
        backend: 'Next.js API Routes',
        database: 'Cloudflare D1',
        blockchain: 'Ethereum-compatible',
        storage: 'IPFS + Cloudflare'
      },
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      platform: platformInfo
    });
  } catch (error) {
    console.error('Ошибка при получении информации о платформе:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновление настроек платформы (только для администраторов)
export async function PUT(request: NextRequest) {
  // Проверка прав доступа
  const accessCheck = await withRoleCheck(AccessRequirements.ADMIN_ONLY)(request, async () => {
    try {
      const data = await request.json();
      
      // В реальном приложении здесь был бы код для обновления настроек платформы
      
      return NextResponse.json({
        success: true,
        message: 'Настройки платформы успешно обновлены',
        updatedSettings: data
      });
    } catch (error) {
      console.error('Ошибка при обновлении настроек платформы:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}
