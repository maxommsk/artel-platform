// API для управления тарифными планами
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { withRoleCheck, AccessRequirements } from '@/lib/rbac';
import { Tariff, TariffCreateInput, TariffUpdateInput } from '@/lib/models';

// Получение всех тарифных планов
export async function GET(request: NextRequest) {
  try {
    const tariffs = await db.prepare(
      'SELECT * FROM tariffs ORDER BY initial_payment_percent'
    );
    
    return NextResponse.json({
      success: true,
      tariffs
    });
  } catch (error) {
    console.error('Ошибка при получении тарифных планов:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Создание нового тарифного плана (только для администраторов)
export async function POST(request: NextRequest) {
  // Проверка прав доступа
  const accessCheck = await withRoleCheck(AccessRequirements.ADMIN_ONLY)(request, async () => {
    try {
      const data: TariffCreateInput = await request.json();
      
      // Проверка наличия обязательных полей
      if (!data.name || data.initial_payment_percent === undefined || 
          data.monthly_payment_percent === undefined || data.max_term_months === undefined ||
          data.acceleration_coefficient === undefined) {
        return NextResponse.json(
          { success: false, message: 'Не указаны обязательные поля' },
          { status: 400 }
        );
      }
      
      // Создание тарифного плана
            // Создание тарифного плана
      const result = await db.prepare(
        `INSERT INTO tariffs (name, description, initial_payment_percent, monthly_payment_percent, 
                             max_term_months, acceleration_coefficient, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        data.name as string,
        data.description as string,
        data.initial_payment_percent as number,
        data.monthly_payment_percent as number,
        data.max_term_months as number,
        data.acceleration_coefficient as number,
        data.is_active ?? true
      ).run();

      
      const tariffId = result.meta.last_row_id;
      
      // Получение созданного тарифного плана
            const newTariff = await db.prepare(
        'SELECT * FROM tariffs WHERE id = ?'
      ).bind(tariffId).first<any>(); // Замените any на ваш тип тарифа, если он есть

      
            if (!newTariff) {
        return NextResponse.json(
          { success: false, message: 'Ошибка при создании тарифного плана' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Тарифный план успешно создан',
        tariff: newTariff[0]
      });
      
    } catch (error) {
      console.error('Ошибка при создании тарифного плана:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}
