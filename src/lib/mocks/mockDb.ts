// src/lib/mocks/mockDb.ts
export function createMockDb() {
  console.log('Using mock database');
  
  // Для хранения созданных пользователей
  const users = [{
    id: 1, 
    username: 'mockuser', 
    email: 'maxommsk@gmail.com',
    password_hash: '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K', // хеш для пароля "password"
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }];
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          console.log('Mock DB query:', query, 'params:', params);
          
          // Для проверки существования пользователя при регистрации
          if (query.includes('SELECT * FROM users WHERE username = ? OR email = ?')) {
            console.log('Mock DB: Checking user existence for registration');
            return { results: [] };
          }
          
          // Для входа в систему
          if (query.includes('SELECT * FROM users WHERE username = ?') || 
              query.includes('SELECT * FROM users WHERE email = ?')) {
            console.log('Mock DB: User login check');
            // Возвращаем пользователя для любого имени пользователя или email
            return { 
              results: [{ 
                id: 1, 
                username: params[0], 
                email: 'maxommsk@gmail.com',
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
          
          // Для получения пользователя по ID
          if (query.includes('SELECT * FROM users WHERE id = ?')) {
            console.log('Mock DB: Returning mock user for ID query');
            return { 
              results: [{ 
                id: 1, 
                username: 'mockuser', 
                email: 'maxommsk@gmail.com',
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

