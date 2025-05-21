// Утилиты для контроля доступа на основе ролей
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '@/lib/auth';

interface AuthToken {
  id: number;
  username: string;
  roles: string[];
  // другие необходимые поля
}

// Типы ролей в системе
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  USER = 'user'
}

// Интерфейс для определения требований доступа
export interface AccessRequirement {
  roles: Role[];
  condition?: (user: AuthToken) => boolean;
}

export function checkRole() {
  return true;
}

// Функция для проверки доступа на основе ролей
export function checkAccess(user: AuthToken | null, requirement: AccessRequirement): boolean {
  if (!user) return false;
  
  // Проверка наличия хотя бы одной из требуемых ролей
  const hasRequiredRole = requirement.roles.some(role => hasRole(user, role));
  
  // Если есть дополнительное условие, проверяем его
  if (requirement.condition && hasRequiredRole) {
    return requirement.condition(user);
  }
  
  return hasRequiredRole;
}

// Middleware для защиты API маршрутов на основе ролей
export function withRoleCheck(requirement: AccessRequirement) {
  return async function(req: NextRequest, next: () => Promise<NextResponse>) {
    const user = await getCurrentUser();
    
if (!checkAccess(user, requirement)) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }
    
    return next();
  };
}

// Предопределенные требования доступа для различных разделов системы
export const AccessRequirements = {
  // Доступ только для администраторов
  ADMIN_ONLY: {
    roles: [Role.ADMIN]
  },
  
  // Доступ для администраторов и менеджеров
  ADMIN_AND_MANAGER: {
    roles: [Role.ADMIN, Role.MANAGER]
  },
  
  // Доступ для пайщиков, менеджеров и администраторов
  MEMBER_AND_ABOVE: {
    roles: [Role.ADMIN, Role.MANAGER, Role.MEMBER]
  },
  
  // Доступ для всех аутентифицированных пользователей
  AUTHENTICATED: {
    roles: [Role.ADMIN, Role.MANAGER, Role.MEMBER, Role.USER]
  },
  
  // Доступ для пайщика к своим данным
  MEMBER_OWN_DATA: {
    roles: [Role.ADMIN, Role.MANAGER, Role.MEMBER],
    condition: (user: AuthToken) => {
      // Администраторы и менеджеры имеют доступ ко всем данным
      if (hasRole(user, Role.ADMIN) || hasRole(user, Role.MANAGER)) {
        return true;
      }
      
      // Пайщики имеют доступ только к своим данным
      // Здесь должна быть проверка, что запрашиваемые данные принадлежат пользователю
      // Это будет реализовано в конкретных обработчиках API
      return true;
    }
  }
};
