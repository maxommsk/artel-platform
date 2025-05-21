// src/lib/mocks/mockDb.ts
export function createMockDb() {
  console.log('Using mock database');
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          // Для проверки существующих пользователей возвращаем пустой массив
          if (query.includes('SELECT * FROM users WHERE username')) {
            return { 
              results: [{ 
                id: 1, 
                username: params[0], 
                email: `${params[0]}@example.com`,
                password_hash: '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K', // хеш для пароля "password"
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }] 
            };
          }
          // Для получения ролей
          if (query.includes('SELECT r.name FROM roles')) {
            return { results: [{ name: 'user' }] };
          }
          // Для других запросов возвращаем пустой результат
          return { results: [] };
        },
        run: async () => ({ 
          success: true, 
          meta: { last_row_id: 1 }
        })
      })
    })
  };
}
