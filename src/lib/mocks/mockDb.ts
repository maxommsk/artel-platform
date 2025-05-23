// src/lib/mocks/mockDb.ts
export function createMockDb() {
  console.log('Using mock database');
  
  // Для хранения созданных пользователей
  const users = [];
  let lastId = 0;
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          console.log('Mock DB query:', query);
          
          // Для проверки существования пользователя всегда возвращаем пустой массив
          if (query.includes('SELECT * FROM users WHERE username') || 
              query.includes('SELECT * FROM users WHERE username = ? OR email = ?')) {
            console.log('Mock DB: Returning empty results for user existence check');
            return { results: [] };
          }
          
          // Для получения ролей
          if (query.includes('SELECT r.name FROM roles')) {
            return { results: [{ name: 'user' }] };
          }
          
          // Для получения пользователя по ID
          if (query.includes('SELECT * FROM users WHERE id = ?')) {
            console.log('Mock DB: Returning mock user for ID query');
            return { 
              results: [{ 
                id: 1, 
                username: 'mockuser', 
                email: 'mock@example.com',
                password_hash: '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }] 
            };
          }
          
          // Для других запросов возвращаем пустой результат
          return { results: [] };
        },
        
        run: async () => {
          console.log('Mock DB run query:', query);
          
          // Для INSERT INTO users
          if (query.includes('INSERT INTO users')) {
            lastId = 1;
            console.log('Mock DB: Created user with ID', lastId);
          }
          
          // Для всех запросов возвращаем успешный результат
          return { 
            success: true, 
            meta: { last_row_id: lastId || 1 }
          };
        }
      })
    })
  };
}

