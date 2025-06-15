import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

  // Здесь должно быть реальное отправление письма
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: email,
      subject: 'Приглашение стать администратором',
      text: `Вас приглашают стать администратором.\nЛогин: ${email}\nПароль: Serp2025\nПерейдите по ссылке: ${process.env.BASE_URL}/admin/login`
    });
    return NextResponse.json({ message: 'Приглашение отправлено' });
  } catch (e) {
    console.log('Email send error', e);
    return NextResponse.json({ message: 'Не удалось отправить письмо' }, { status: 500 });
  }
}
