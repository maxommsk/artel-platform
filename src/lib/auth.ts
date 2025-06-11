import { cookies } from 'next/headers';
import type { User } from './models';
import bcrypt from 'bcryptjs';

async function getJose() {
  return await import('jose');
}
const BCRYPT_ROUNDS = 12;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'znk-artel-secret-key');
const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const AUTH_COOKIE_NAME = 'auth_token';

// --- Password Hashing (SHA-256, not bcrypt) ---
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}


// --- JWT Token Generation ---
export async function createToken(
  user: Pick<User, 'id' | 'username' | 'roles'>,
  roles: string[]
): Promise<string> {
  const { SignJWT } = await getJose();
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
    const { jwtVerify } = await getJose();
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
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  
  const userRoleNames = user.roles.map((r: any) => 
    typeof r === 'string' ? r : r.name
  );
  
  if (Array.isArray(role)) {
    return role.some(r => userRoleNames.includes(r));
  }
  return userRoleNames.includes(role);
}


