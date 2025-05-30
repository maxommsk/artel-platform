'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { MessagesList } from './MessagesModule'; // Импортируем новый компонент

// ... ваши текущие импорты ...

// ... ваши текущие импорты и другие интерфейсы ...


// ... ваши текущие импорты и другие интерфейсы ...

interface UserApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user: {
    id: number;
    name: string;
    email: string;
    username?: string; // Добавляем как опциональное
    roles?: string[]; // Добавляем как опциональное
    language?: string; // Добавляем поле language как опциональное
    // ... другие поля ...
  };
  // ... другие поля, которые может вернуть API ...
}
// ... остальной код вашего файла Dashboard.tsx ...


interface MemberApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  member: {
    // Определите структуру объекта member в соответствии с вашим API
    // Например:
    id: number;
    name: string;
    // ... другие поля ...
  };
  // ... другие поля, которые может вернуть API ...
}

// ... остальной код вашего файла Dashboard.tsx ...


// Определение типа для контекста локализации
interface LocaleContextType {
  locale: string;
  setLocale: (newLocale: string) => void; // Изменено с changeLocale на setLocale
  t: (key: string) => string;
  // ... другие свойства ...
}

// Теперь создание контекста с правильным типом
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// ... остальной код вашего файла Dashboard.tsx ...


interface ProfileUpdateApiResponse { // или используйте ваш общий ApiErrorResponse
  success?: boolean; // Если API возвращает такой флаг
  message?: string;  // Поле для сообщения (об успехе или ошибке)
  error?: string;    // Поле для сообщения об ошибке
  user?: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    roles: string[];
    language?: string;
  };
  // ... другие поля, которые может вернуть API обновления профиля ...
}

// ... остальной код вашего файла Dashboard.tsx ...

// Хук для использования локализации
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

// Пример словаря переводов
const translations: Record<string, Record<string, string>> = {
  ru: {
    dashboardTitle: 'ЖНК "Артель"',
    logout: 'Выход',
    profile: 'Профиль',
    contributions: 'Взносы',
    documents: 'Документы',
    roadmap: 'Дорожная карта',
    tokens: 'Токены',
    calculator: 'Калькулятор',
    messages: 'Сообщения', // Новая вкладка
    members: 'Пайщики',
    properties: 'Недвижимость',
    users: 'Пользователи',
    settings: 'Настройки',
    // ... другие переводы ...
  },
  en: {
    dashboardTitle: 'ZNK "Artel"',
    logout: 'Logout',
    profile: 'Profile',
    contributions: 'Contributions',
    documents: 'Documents',
    roadmap: 'Roadmap',
    tokens: 'Tokens',
    calculator: 'Calculator',
    messages: 'Messages', // New tab
    members: 'Members',
    properties: 'Properties',
    users: 'Users',
    settings: 'Settings',
    // ... other translations ...
  },
};

// Провайдер локализации
export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState('ru'); // Язык по умолчанию

  // Пытаемся получить язык из localStorage при инициализации
  useEffect(() => {
    const savedLocale = localStorage.getItem('znkArtelLocale');
    if (savedLocale && (savedLocale === 'ru' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    if (newLocale === 'ru' || newLocale === 'en') {
        setLocaleState(newLocale);
        localStorage.setItem('znkArtelLocale', newLocale); // Сохраняем выбор
    }
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] || key; // Возвращаем ключ, если перевод не найден
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

// Интерфейс для данных пользователя
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
  roles: string[];
  language?: string; // Добавлено поле языка
}

// Компонент навигационной панели
export function DashboardNavbar({ user, activeTab, onTabChange }: { 
  user: User | null; 
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  // Определение доступных вкладок в зависимости от роли пользователя
  const getTabs = () => {
    const tabs = [
      { id: 'profile', labelKey: 'profile', roles: ['guest', 'user', 'member', 'manager', 'admin'] }, // Добавлена роль guest для ТЗ
      { id: 'messages', labelKey: 'messages', roles: ['user', 'member', 'manager', 'admin'] }, // Новая вкладка Сообщения
    ];

    // Роли из ТЗ: guest, member, administrator
    // Наши роли: guest, user, member, manager, admin
    // Адаптируем: guest -> guest, user -> guest, member -> member, manager -> admin, admin -> admin
    const userRoles = user?.roles?.map(role => {
        if (role === 'user') return 'guest';
        if (role === 'manager') return 'admin';
        return role;
    }) || ['guest'];

    if (userRoles.includes('member') || userRoles.includes('admin')) {
      tabs.push(
        { id: 'contributions', labelKey: 'contributions', roles: ['member', 'admin'] },
        { id: 'documents', labelKey: 'documents', roles: ['member', 'admin'] },
        { id: 'roadmap', labelKey: 'roadmap', roles: ['member', 'admin'] },
        { id: 'tokens', labelKey: 'tokens', roles: ['member', 'admin'] },
        { id: 'calculator', labelKey: 'calculator', roles: ['guest', 'member', 'admin'] } // Доступен и guest
      );
    }

    if (userRoles.includes('admin')) {
      tabs.push(
        { id: 'members', labelKey: 'members', roles: ['admin'] },
        { id: 'properties', labelKey: 'properties', roles: ['admin'] },
        { id: 'users', labelKey: 'users', roles: ['admin'] },
        { id: 'settings', labelKey: 'settings', roles: ['admin'] }
      );
    }

    // Фильтруем вкладки по ролям пользователя (адаптированным)
    return tabs.filter(tab => userRoles.some(role => tab.roles.includes(role)));
  };

  const tabs = getTabs();

  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600 mr-8">{t('dashboardTitle')}</h1>
            <nav className="flex space-x-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center flex-shrink-0 ml-4">
            <span className="text-gray-700 mr-4 hidden sm:inline">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </span>
            {/* Выбор языка */} 
            <select 
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="mr-4 px-2 py-1 border rounded text-sm bg-white"
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент профиля пользователя
export function ProfileTab({ user, setUser }: { user: User | null; setUser: (user: User) => void }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    middle_name: user?.middle_name || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    console.log('Отправляемые данные:', formData);
    
    try {
      // Добавляем токен авторизации из localStorage, если он есть
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Токен авторизации добавлен в заголовки');
      } else {
        console.log('Токен авторизации отсутствует');
      }

      console.log('Заголовки запроса:', headers);
      
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          phone: formData.phone,
        }),
      });

      console.log('Статус ответа:', response.status);
      
      let data: ProfileUpdateApiResponse = {};
      let responseText = '';
      
      try {
        responseText = await response.text();
        console.log('Текст ответа:', responseText);
        
        if (responseText && responseText.trim()) {
          try {
            data = JSON.parse(responseText);
            console.log('Распарсенные данные:', data);
          } catch (parseError) {
            console.error('Ошибка при парсинге JSON:', parseError);
          }
        } else {
          console.log('Получен пустой ответ от сервера');
        }
      } catch (textError) {
        console.error('Ошибка при получении текста ответа:', textError);
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Ошибка при обновлении профиля (${response.status})`;
        console.error('Ошибка запроса:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Профиль успешно обновлен');
      setMessage({ text: 'Профиль успешно обновлен', type: 'success' });
      
      // Обновляем данные пользователя в родительском компоненте и localStorage
      if (user) {
        // Создаем обновленный объект пользователя, сохраняя все существующие поля
        const updatedUser = {
          ...user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          phone: formData.phone
        };
        
        // Обновляем состояние пользователя в родительском компоненте
        setUser(updatedUser);
        
        // Обновляем данные пользователя в localStorage
        try {
          const storedUserData = localStorage.getItem('user');
          if (storedUserData) {
            const storedUser = JSON.parse(storedUserData);
            const updatedStoredUser = {
              ...storedUser,
              first_name: formData.first_name,
              last_name: formData.last_name,
              middle_name: formData.middle_name,
              phone: formData.phone
            };
            localStorage.setItem('user', JSON.stringify(updatedStoredUser));
            console.log('Данные пользователя в localStorage обновлены');
          }
        } catch (storageError) {
          console.error('Ошибка при обновлении localStorage:', storageError);
        }
      }
    } catch (err: any) {
      console.error('Перехваченная ошибка:', err);
      setMessage({ text: err.message || 'Неизвестная ошибка при обновлении профиля', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Профиль пользователя</h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Имя пользователя:</p>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Роли:</p>
            <p className="font-medium">{user?.roles?.join(', ') || 'Не указаны'}</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Редактирование профиля</h3>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="last_name" className="block text-gray-700 font-medium mb-2">
              Фамилия
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="first_name" className="block text-gray-700 font-medium mb-2">
              Имя
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="middle_name" className="block text-gray-700 font-medium mb-2">
              Отчество
            </label>
            <input
              type="text"
              id="middle_name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}

// Компонент для отображения информации о членстве
export function MembershipInfo({ user }: { user: User | null }) {
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await fetch('/api/member/info');
        // Явно типизируем результат запроса
        const data = await response.json() as MemberApiResponse;
        setMemberData(data.member);
      } catch (err) {
        setError('Ошибка при загрузке данных о членстве');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Загрузка информации о членстве...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (!memberData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Информация о членстве</h2>
        <p className="mb-4">Вы не являетесь пайщиком ЖНК "Артель". Чтобы стать пайщиком, ознакомьтесь с тарифами и подайте заявку.</p>
        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Ознакомиться с тарифами
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Информация о членстве</h2>
      {/* Отображение данных о членстве */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Здесь отображаем данные из memberData */}
      </div>
    </div>
  );
}

// Основной компонент Dashboard
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const checkAuth = async () => {
      try {
        // Сначала пытаемся получить пользователя из localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');
        
        if (storedUser && storedToken) {
          // Если есть данные в localStorage, используем их
          setUser(JSON.parse(storedUser));
          setLoading(false);
          
          // Дополнительно проверяем валидность токена на сервере
          try {
            const response = await fetch('/api/auth/verify', {
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            });
            
            if (!response.ok) {
              // Если токен недействителен, очищаем localStorage и перенаправляем на страницу входа
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              router.push('/login');
            }
          } catch (verifyError) {
            console.error('Ошибка при проверке токена:', verifyError);
          }
        } else {
          // Если нет данных в localStorage, перенаправляем на страницу входа
          router.push('/login');
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Функция для отображения содержимого активной вкладки
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} setUser={setUser} />;
      case 'messages':
        return <MessagesList user={user} />;
      // Другие вкладки...
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">В разработке</h2>
            <p>Данный раздел находится в разработке.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <LocaleProvider>
      <div className="min-h-screen bg-gray-100">
        <DashboardNavbar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="container mx-auto px-4 py-6">
          {renderTabContent()}
        </div>
      </div>
    </LocaleProvider>
  );
}

