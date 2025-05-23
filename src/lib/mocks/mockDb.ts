// src/lib/mocks/mockDb.ts
export function createMockDb() {
  console.log('Using mock database');
  
  // Для хранения созданных пользователей
  const users = [];
  
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
          
          // Для других запросов возвращаем пустой результат
          return { results: [] };
        },
        
        run: async () => {
          console.log('Mock DB run query:', query);
          
          // Для всех запросов возвращаем успешный результат
          return { 
            success: true, 
            meta: { last_row_id: 1 }
          };
        }
      })
    })
  };
}

