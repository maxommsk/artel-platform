import { NextRequest, NextResponse } from 'next/server';
import { pool, initDatabase } from '@/lib/db-neon';

export async function GET() {
  await initDatabase();
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.username, u.status, COALESCE(r.name, 'user') as role
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id`
  );
  return NextResponse.json({ users: rows });
}

export async function PUT(request: NextRequest) {
  await initDatabase();
  const { id, status } = (await request.json()) as { id?: number; status?: string };
  await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
  return NextResponse.json({ success: true });
}
