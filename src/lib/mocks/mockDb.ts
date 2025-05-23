// src/lib/mocks/mockDb.ts
export function createMockDb() {
  console.log('Using mock database');
  
  // Хранилище для имитации пользователей в памяти
  const users: any[] = [];
  let lastId = 0;
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => {
          // Проверка существования пользователя (для регистрации)
          if (query.includes('SELECT * FROM users WHERE username = ? OR email = ?')) {
            console.log('Mock DB: Checking user existence for registration');
            const username = params[0];
            const email = params[1];
            
            // Поиск пользователя в нашем хранилище
            const existingUsers = users.filter(u => 
              u.username === username || u.email === email
            );
            
            return { results: existingUsers };
          }
          
          // Поиск пользователя по имени (для входа)
          if (query.includes('SELECT * FROM users WHERE username = ?')) {
            console.log('Mock DB: Checking user for login');
            const username = params[0];
            
            // Если пользователей нет, создаем тестового для входа
            if (users.length === 0) {
              users.push({
                id: 1,
                username: username,
                email: `${username}@example.com`,
                password_hash: '$2a$10$XQxBGI0Vz8mGUx.j3UZBxeKFH9CCzZpHJoB1aP5RgXJJcBpHwFp2K', // хеш для пароля "password"
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            
            const user = users.find(u => u.username === username);
            return { results: user ? [user] : [] };
          }
          
          // Получение ролей пользователя
          if (query.includes('SELECT r.name FROM roles')) {
            return { results: [{ name: 'user' }] };
          }
          
          // Для других запросов возвращаем пустой результат
          return { results: [] };
        },
        
        run: async () => {
          // Создание нового пользователя
          if (query.includes('INSERT INTO users')) {
            lastId++;
            const newUser = {
              id: lastId,
              username: params[0],
              email: params[1],
              password_hash: params[2],
              phone: params[3],
              first_name: params[4],
              last_name: params[5],
              middle_name: params[6],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            users.push(newUser);
            console.log(`Mock DB: Created new user with ID ${lastId}`);
            
            return { 
              success: true, 
              meta: { last_row_id: lastId }
            };
          }
          
          // Для других запросов возвращаем успешный результат
          return { 
            success: true, 
            meta: { last_row_id: lastId || 1 }
          };
        }
      })
    })
  };
}

