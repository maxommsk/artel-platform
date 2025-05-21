// API для управления дорожной картой накопления
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { withRoleCheck, AccessRequirements } from '@/lib/rbac';
import { getCurrentUser } from '@/lib/auth';

// Получение данных дорожной карты пользователя
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
      
      // Получение данных пайщика
          const { results: members } = await db.prepare(
      `SELECT 
    m.id as member_id, 
    m.user_id, 
    m.current_phase, 
    m.current_step,
    m.queue_position,
    m.acceleration_coefficient,
    m.queue_date, -- Добавлено это поле
    t.phases as tariff_phases,
    t.initial_payment_percent,
    t.monthly_payment_percent
  FROM members m
   LEFT JOIN tariffs t ON m.tariff_id = t.id
   WHERE m.user_id = ?

`
        ).bind(user.id as number).all<{ member_id: number; user_id: number; current_phase: any; current_step: any; queue_position: number | null; acceleration_coefficient: number | null; queue_date: string | null; tariff_phases: any; initial_payment_percent: number | null; monthly_payment_percent: number | null; }>();



 

      
      if (members.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Пользователь не является пайщиком' },
          { status: 403 }
        );
      }
      
      const member = members[0];
      const memberId = member.member_id;
      
      // Получение суммы взносов пайщика
            const contributionsResult = await db.prepare(
        `SELECT SUM(amount) as total_amount
         FROM contributions
         WHERE member_id = ? AND status = 'обработан'`
      ).bind(memberId).first<{ total_amount: number | null }>();

      
            const totalContributions = contributionsResult?.total_amount || 0;
      
      // Получение целевой суммы (стоимость недвижимости)
      // В реальном приложении это может быть связано с конкретным объектом недвижимости
      const targetAmount = 3000000; // Пример значения
      
      // Расчет суммы первоначального взноса
      const initialPaymentAmount = targetAmount * ((member.initial_payment_percent ?? 0) / 100);
      
      // Расчет прогресса накопления
      const progressPercent = Math.min(100, Math.round((totalContributions / initialPaymentAmount) * 100));
      
      // Расчет оставшейся суммы для накопления
      const remainingAmount = Math.max(0, initialPaymentAmount - totalContributions);
      
      // Расчет ежемесячного платежа
      const monthlyPayment = targetAmount * ((member.monthly_payment_percent ?? 0) / 100);
      
      // Расчет предполагаемой даты постановки в очередь
      let estimatedQueueDate = null;
      if (remainingAmount > 0 && monthlyPayment > 0) {
        const remainingMonths = Math.ceil(remainingAmount / monthlyPayment);
        const queueDate = new Date();
        queueDate.setMonth(queueDate.getMonth() + remainingMonths);
        estimatedQueueDate = queueDate.toISOString().split('T')[0];
      }
      
      // Расчет предполагаемой даты получения недвижимости
      let estimatedAcquisitionDate = null;
      if (member.queue_position) {
        // Если пайщик уже в очереди, расчет на основе позиции
        const acquisitionDate = new Date();
        acquisitionDate.setMonth(acquisitionDate.getMonth() + member.queue_position * 3); // Примерно 3 месяца на каждую позицию
        estimatedAcquisitionDate = acquisitionDate.toISOString().split('T')[0];
      } else if (estimatedQueueDate) {
        // Если пайщик еще не в очереди, расчет на основе даты постановки в очередь
        const acquisitionDate = new Date(estimatedQueueDate);
        acquisitionDate.setMonth(acquisitionDate.getMonth() + 12); // Примерно 12 месяцев после постановки в очередь
        estimatedAcquisitionDate = acquisitionDate.toISOString().split('T')[0];
      }
      
      // Расчет точки ускорения (количество новых пайщиков для ускорения)
      const accelerationCoefficient = member.acceleration_coefficient ?? 1; // Значение по умолчанию 1, если null
const accelerationPoint = accelerationCoefficient !== 0 ? Math.ceil(10 / accelerationCoefficient) : Infinity; // Избегаем деления на ноль

      
      // Формирование вех дорожной карты
      const milestones = [
        { percent: 0, label: 'Начало', reached: true },
        { percent: 15, label: '15%', reached: progressPercent >= 15 },
        { percent: 30, label: 'Постановка в очередь', reached: progressPercent >= 30 || member.queue_position !== null },
        { percent: 50, label: '50%', reached: progressPercent >= 50 },
        { percent: 75, label: '75%', reached: progressPercent >= 75 },
        { percent: 100, label: 'Получение недвижимости', reached: progressPercent >= 100 }
      ];
      
      // Формирование ответа
      const roadmapData = {
        targetAmount,
        initialPaymentPercent: member.initial_payment_percent,
        initialPaymentAmount,
        currentAmount: totalContributions,
        remainingAmount,
        progressPercent,
        monthlyPayment,
        estimatedQueueDate,
        estimatedAcquisitionDate,
        accelerationPoint,
        milestones,
        queuePosition: member.queue_position,
        queueDate: member.queue_date
      };
      
      return NextResponse.json({
        success: true,
        roadmap: roadmapData
      });
      
    } catch (error) {
      console.error('Ошибка при получении данных дорожной карты:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}
