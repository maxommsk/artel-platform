// src/lib/mocks/mockDb.ts
export function createMockDb() {
  console.log('Using mock database');
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          console.log('Mock DB query:', query);
          console.log('Mock DB params:', params);
          
          // Для проверки существования пользователя всегда возвращаем пустой массив
          if (query.includes('SELECT * FROM users WHERE username')) {
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
          console.log('Mock DB run params:', params);
          
          return { 
            success: true, 
            meta: { last_row_id: 1 }
          };
        }
      })
    })
  };
}

