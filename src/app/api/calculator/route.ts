// src/app/api/calculator/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRoleCheck, AccessRequirements } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_TARIFFS: Record<number, {
  name: string;
  initial_payment_percent: number;
  monthly_payment_percent: number;
  max_term_months: number;
  acceleration_coefficient: number;
}> = {
  1: {
    name: "Стандарт",
    initial_payment_percent: 20,
    monthly_payment_percent: 0.5,
    max_term_months: 15 * 12,
    acceleration_coefficient: 0.01,
  },
  2: {
    name: "Оптимальный",
    initial_payment_percent: 30,
    monthly_payment_percent: 0.7,
    max_term_months: 10 * 12,
    acceleration_coefficient: 0.015,
  },
  3: {
    name: "Ускоренный",
    initial_payment_percent: 50,
    monthly_payment_percent: 1,
    max_term_months: 5 * 12,
    acceleration_coefficient: 0.02,
  },
};

interface CalculatorInput {
  tariff_id: number;
  property_price: number;
  new_members_count: number;
}

// Расчет точки ускорения
export async function POST(request: NextRequest) {
  const data = (await request.json()) as CalculatorInput;

  if (!data.tariff_id || !data.property_price || !data.new_members_count) {
    return NextResponse.json(
      { success: false, message: "Не указаны обязательные поля" },
      { status: 400 }
    );
  }

  try {
    let tariff: {
      name: string;
      initial_payment_percent: number;
      monthly_payment_percent: number;
      max_term_months: number;
      acceleration_coefficient: number;
    } | null = null;

    if (db) {
      try {
        const { results: tariffs } = await db
          .prepare(`SELECT * FROM tariffs WHERE id = ?`)
          .bind(data.tariff_id)
          .all();
        if (tariffs.length > 0) {
          tariff = tariffs[0] as typeof tariff;
        }
      } catch (err) {
        console.error("DB error while fetching tariff:", err);
      }
    }

    if (!tariff) {
      tariff = DEFAULT_TARIFFS[data.tariff_id] || null;
    }

    if (!tariff) {
      return NextResponse.json(
        { success: false, message: "Указанный тариф не существует" },
        { status: 404 }
      );
    }

    const initialPaymentAmount =
      data.property_price * (tariff.initial_payment_percent / 100);
    const monthlyPaymentAmount =
      data.property_price * (tariff.monthly_payment_percent / 100);
    const baseTermMonths = Math.min(
      tariff.max_term_months,
      Math.ceil(
        (data.property_price - initialPaymentAmount) / monthlyPaymentAmount
      )
    );

    const accelerationEffect =
      data.new_members_count * tariff.acceleration_coefficient;

    const accelerationMonths = Math.max(
      1,
      Math.round(baseTermMonths * (1 - accelerationEffect))
    );

    const savedMonths = baseTermMonths - accelerationMonths;

    const user = await getCurrentUser();
    let memberId: number | null = null;

    if (user && db) {
      try {
        const { results: members } = await db
          .prepare("SELECT id FROM members WHERE user_id = ?")
          .bind(user.userId)
          .all();

        if (members.length > 0) {
          memberId = members[0].id as number;
        }
      } catch (err) {
        console.error("DB error while fetching member:", err);
      }
    }

    let calculationId: number | null = null;
    if (memberId && db) {
      try {
        const result = await db
          .prepare(
            `INSERT INTO acceleration_calculations (
              member_id, tariff_id, initial_payment_amount, monthly_payment_amount,
              property_price, base_term_months, new_members_count,
              accelerated_term_months, saved_months
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            memberId,
            data.tariff_id,
            initialPaymentAmount,
            monthlyPaymentAmount,
            data.property_price,
            baseTermMonths,
            data.new_members_count,
            accelerationMonths,
            savedMonths
          )
          .run();

        calculationId = result.meta.last_row_id;
      } catch (err) {
        console.error("DB error while saving calculation:", err);
      }
    }

    const calculationResult = {
      tariff_id: data.tariff_id,
      tariff_name: tariff.name,
      property_price: data.property_price,
      initial_payment_percent: tariff.initial_payment_percent,
      initial_payment_amount: initialPaymentAmount,
      monthly_payment_percent: tariff.monthly_payment_percent,
      monthly_payment_amount: monthlyPaymentAmount,
      base_term_months: baseTermMonths,
      new_members_count: data.new_members_count,
      acceleration_coefficient: tariff.acceleration_coefficient,
      accelerated_term_months: accelerationMonths,
      saved_months: savedMonths,
      saved_percent: Math.round((savedMonths / baseTermMonths) * 100),
      id: calculationId,
    };

    return NextResponse.json({
      success: true,
      calculation: calculationResult,
    });
  } catch (error) {
    console.error("Ошибка при расчете точки ускорения:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Получение истории расчетов пользователя
export async function GET(request: NextRequest) {
  const accessCheck = await withRoleCheck(AccessRequirements.MEMBER_OWN_DATA)(
    request,
    async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json(
            { success: false, message: "Требуется аутентификация" },
            { status: 401 }
          );
        }

        const { results: members } = await db
          .prepare("SELECT id FROM members WHERE user_id = ?")
          .bind(user.userId)
          .all();

        if (members.length === 0) {
          return NextResponse.json(
            { success: false, message: "Пользователь не является пайщиком" },
            { status: 403 }
          );
        }

        const memberId = members[0].id;

        const { results: calculations } = await db
          .prepare(
            `SELECT ac.*, t.name as tariff_name
         FROM acceleration_calculations ac
         JOIN tariffs t ON ac.tariff_id = t.id
         WHERE ac.member_id = ?
         ORDER BY ac.calculation_date DESC
         LIMIT 10`
          )
          .bind(memberId)
          .all();

        return NextResponse.json({
          success: true,
          calculations,
        });
      } catch (error) {
        console.error("Ошибка при получении истории расчетов:", error);
        return NextResponse.json(
          { success: false, message: "Внутренняя ошибка сервера" },
          { status: 500 }
        );
      }
    }
  );

  return accessCheck;
}
