#!/bin/bash

echo "🔧 Обновление src/app/api/auth/register/route.ts ..."

cat > src/app/api/auth/register/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  hashPassword,
  createToken,
  setAuthCookie,
  AuthResult,
  RegisterData
} from '@/lib/auth';
import { User, UserCreateInput } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const data: RegisterData = await request.json();

    if (!data.username || !data.email || !data.password) {
      return NextResponse.json({ success: false, message: 'Не указаны обязательные поля' }, { status: 400 });
    }

    const existingUser = db.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).all(data.username, data.email) as User[];

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: 'Пользователь с таким именем или email уже существует' }, { status: 409 });
    }

    const password_hash = await hashPassword(data.password);

    const userInput: UserCreateInput = {
      username: data.username,
      email: data.email,
      password_hash,
      phone: data.phone,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name
    };

    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, phone, first_name, last_name, middle_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userInput.username,
      userInput.email,
      userInput.password_hash,
      userInput.phone || null,
      userInput.first_name || null,
      userInput.last_name || null,
      userInput.middle_name || null
    );

    const userId = result.lastInsertRowid as number;

    db.prepare(`INSERT INTO user_roles (user_id, role_id)
                SELECT ?, id FROM roles WHERE name = 'user'`).run(userId);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;

    if (!newUser) {
      return NextResponse.json({ success: false, message: 'Ошибка при создании пользователя' }, { status: 500 });
    }

    const roles = db.prepare(`
      SELECT r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `).all(userId) as { name: string }[];

    const roleNames = roles.map(r => r.name);
    const token = createToken(newUser, roleNames);
    setAuthCookie(token);

    const { password_hash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Регистрация успешно завершена',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json({ success: false, message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
EOF

echo "✅ src/app/api/auth/register/route.ts обновлён."
