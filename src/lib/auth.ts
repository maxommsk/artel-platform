const jose = require('jose');
const { SignJWT, jwtVerify } = jose;
import { cookies } from 'next/headers';
import type { User } from './models';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'znk-artel-secret-key');
const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const AUTH_COOKIE_NAME = 'auth_token';

// --- Password Hashing (SHA-256, not bcrypt) ---
export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Buffer.from(hashBuffer).toString('hex');
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === hashed;
}

// --- JWT Token Generation ---
export async function createToken(
  user: Pick<User, 'id' | 'username' | 'roles'>,
  roles: string[]
): Promise<string> {
  return await new SignJWT({
  id: user.id,
  username: user.username,
  roles, // только roles, убираем role
})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRATION_SECONDS}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// --- Auth Cookie Management ---
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRATION_SECONDS
  });
}

export function clearAuthCookie() {
  // Возвращает пустой куки (по твоей логике)
  return {
    name: 'token',
    value: '',
    options: {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 0,
    }
  };
}

export async function getCurrentUser(): Promise<any | null> {
  const cookieStore = await cookies();
const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function hasRole(user: any, role: string | string[]): boolean {
  if (!user?.role) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}

