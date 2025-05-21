// API для управления взносами и платежами
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { withRoleCheck, AccessRequirements } from '@/lib/rbac';
import { Contribution } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// Получение взносов пользователя
export async function GET(request: NextRequest) {
  // Проверка прав доступа
  const accessCheck = await withRoleCheck(AccessRequirements.MEMBER_OWN_DATA)(request, async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Требуется аутентификация' },
          { status: 401 }
        );
      }
      
      // Получение ID пайщика для текущего пользователя
            const { results: members } = await db.prepare(
  'SELECT id FROM members WHERE user_id = ?'
).bind(user.id as number).all<{ id: number }>();


      
      if (members.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Пользователь не является пайщиком' },
          { status: 403 }
        );
      }
      
      const memberId = members[0].id as number;
      
      // Получение взносов пайщика
            const { results: contributions } = await db.prepare( 'SELECT * FROM contributions WHERE member_id = ? ORDER BY created_at DESC' ).bind(memberId as number).all<Contribution>(); 
 
      
      // Расчет общей суммы взносов
      const totalAmount = contributions.reduce((sum, contribution) => sum + (contribution.amount as number), 0);
      
      return NextResponse.json({
        success: true,
        contributions,
        totalAmount
      });
      
    } catch (error) {
      console.error('Ошибка при получении взносов:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}

// Создание нового взноса
export async function POST(request: NextRequest) {
  // Проверка прав доступа
  const accessCheck = await withRoleCheck(AccessRequirements.MEMBER_OWN_DATA)(request, async () => {
    try {
            const data = await request.json() as { amount: number; contribution_type: string; payment_method: string; transaction_id?: string };

      
      // Проверка наличия обязательных полей
      if (!data.amount || !data.contribution_type || !data.payment_method) {
        return NextResponse.json(
          { success: false, message: 'Не указаны обязательные поля' },
          { status: 400 }
        );
      }
      
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Требуется аутентификация' },
          { status: 401 }
        );
      }
      
      // Получение ID пайщика для текущего пользователя
      const { results: members } = await db.prepare(
  'SELECT id FROM members WHERE user_id = ?'
).bind(user.id as number).all<{ id: number }>();

      
      if (members.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Пользователь не является пайщиком' },
          { status: 403 }
        );
      }
      
      const memberId = members[0].id as number;
      
      // Получение минимальной суммы взноса из настроек
      const { results: settings } = await db.prepare(
  'SELECT value FROM settings WHERE key = ?'
).bind('min_contribution_amount').all<{ value: string }>();

      
      const minAmount = settings.length > 0 ? parseFloat(settings[0].value as string) : 5000;
      
      if (data.amount < minAmount) {
        return NextResponse.json(
          { success: false, message: `Минимальная сумма взноса: ${minAmount} ₽` },
          { status: 400 }
        );
      }
      
      // Создание взноса
      const result = await db.prepare( `INSERT INTO contributions (member_id, amount, contribution_type, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)` ).bind( memberId as number, data.amount as number, data.contribution_type as string, data.payment_method as string, data.transaction_id || null, 'в обработке' ).run(); 
      
      const contributionId = result.meta.last_row_id;
      
      // Получение созданного взноса
      const { results: newContributionResults } = await db.prepare(
  'SELECT * FROM contributions WHERE id = ?'
).bind(contributionId as number).all<Contribution>(); 
      
      if (!newContributionResults || newContributionResults.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Ошибка при создании взноса' },
          { status: 500 }
        );
      }
      
      // Здесь должна быть интеграция с платежной системой
      // Для демонстрации просто обновляем статус взноса
      await db.prepare( 'UPDATE contributions SET status = ? WHERE id = ?' ).bind( 'обработан', contributionId as number ).run();
      
      // Получение обновленного взноса
       const { results: updatedContributionResults } = await db.prepare(
  'SELECT * FROM contributions WHERE id = ?'
).bind(contributionId as number).all<Contribution>(); 
      
      return NextResponse.json({
        success: true,
        message: 'Взнос успешно создан',
        contribution: updatedContributionResults[0]
      });
      
    } catch (error) {
      console.error('Ошибка при создании взноса:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}
