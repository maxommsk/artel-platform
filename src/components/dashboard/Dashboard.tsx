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
export function ProfileTab({ user }: { user: User | null }) {
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

    // Расширенное логирование для отладки
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
      
      const response = await fetch('/api/user/profile', {
        method: 'POST', // Изменено с PUT на POST
        headers,
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          phone: formData.phone,
        }),
      });

      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));

      // Исправленная обработка ответа с расширенным логированием
      let data: ProfileUpdateApiResponse = {};
      let responseText = '';
      
      try {
        // Получаем текст ответа
        responseText = await response.text();
        console.log('Текст ответа:', responseText);
        
        // Проверяем, есть ли контент в ответе
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

// Компонент для отображения информации о членстве (без изменений)
export function MembershipInfo({ user }: { user: User | null }) {
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await fetch('/api/member/info');
          
const data: MemberApiResponse = await response.json(); // Типизируем data

if (!response.ok) {
  throw new Error(data.message || data.error || 'Ошибка при получении данных о членстве');
}

        setMemberData(data.member);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.roles && user.roles.includes('member')) {
      fetchMemberData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || !user.roles || !user.roles.includes('member')) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Информация о членстве</h2>
        <p className="text-gray-600">
          Вы не являетесь пайщиком ЖНК "Артель". Чтобы стать пайщиком, ознакомьтесь с тарифами и подайте заявку.
        </p>
        <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Ознакомиться с тарифами
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Информация о членстве</h2>
        <p className="text-gray-600">Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Информация о членстве</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Информация о членстве</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">Статус членства:</p>
          <p className="font-medium">{memberData.membership_status}</p>
        </div>
        <div>
          <p className="text-gray-600">Тарифный план:</p>
          <p className="font-medium">{memberData.tariff?.name || 'Не выбран'}</p>
        </div>
        <div>
          <p className="text-gray-600">Позиция в очереди:</p>
          <p className="font-medium">{memberData.queue_position || 'Не в очереди'}</p>
        </div>
        <div>
          <p className="text-gray-600">Дата постановки в очередь:</p>
          <p className="font-medium">{memberData.queue_date || 'Не в очереди'}</p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Паспортные данные</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Серия и номер:</p>
            <p className="font-medium">
              {memberData.passport_series && memberData.passport_number
                ? `${memberData.passport_series} ${memberData.passport_number}`
                : 'Не указаны'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Кем выдан:</p>
            <p className="font-medium">{memberData.passport_issued_by || 'Не указано'}</p>
          </div>
          <div>
            <p className="text-gray-600">Дата выдачи:</p>
            <p className="font-medium">{memberData.passport_issue_date || 'Не указана'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Главный компонент дашборда
export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  const { locale, setLocale } = useLocale(); // Получаем текущий язык и функцию его установки

  useEffect(() => {
    // Проверяем наличие токена авторизации
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Пытаемся получить данные пользователя из localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Убедимся, что у пользователя есть поле roles
        if (!parsedUser.roles) {
          parsedUser.roles = ['user']; // Устанавливаем роль по умолчанию
        }
        setUser(parsedUser);
        setLoading(false);
        
        // Устанавливаем язык пользователя, если он есть и отличается от текущего
        if (parsedUser.language && parsedUser.language !== locale) {
          setLocale(parsedUser.language);
        }
      } catch (err) {
        console.error('Ошибка при парсинге данных пользователя:', err);
        fetchUserData(token);
      }
    } else {
      fetchUserData(token);
    }
  }, [router, locale, setLocale]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Если токен недействителен, перенаправляем на страницу входа
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error('Ошибка при получении данных пользователя');
      }

      const data: UserApiResponse = await response.json();
      
      // Преобразуем данные пользователя к нужному формату
      const userData: User = {
        id: data.user.id,
        username: data.user.username || data.user.name || data.user.email.split('@')[0], // Используем name или часть email как username
        email: data.user.email,
        roles: data.user.roles || ['user'], // Используем роль по умолчанию, если не указана
        language: data.user.language
      };
      
      setUser(userData);
      
      // Устанавливаем язык пользователя, если он есть и отличается от текущего
      if (data.user.language && data.user.language !== locale) {
        setLocale(data.user.language);
      }
      
      // Обновляем данные в localStorage
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message);
      // Перенаправление на страницу входа при ошибке аутентификации
      if (err.message === 'Требуется аутентификация' || (err.response && err.response.status === 401)) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!user) return null; // Не рендерим контент, пока пользователь не загружен

    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileTab user={user} />
            <MembershipInfo user={user} />
          </>
        );
      case 'messages': // Обработка новой вкладки
        return <MessagesList userId={user.id} />;
      case 'contributions':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Взносы</h2>
            <p className="text-gray-600">Здесь будет отображаться информация о взносах.</p>
            {/* TODO: Реализовать компонент ContributionsTab */}
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Документы</h2>
            <p className="text-gray-600">Здесь будет отображаться информация о документах.</p>
            {/* TODO: Реализовать компонент DocumentsTab */}
          </div>
        );
      case 'roadmap':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Дорожная карта</h2>
            <p className="text-gray-600">Здесь будет отображаться дорожная карта накопления.</p>
            {/* TODO: Реализовать компонент RoadmapTab */}
          </div>
        );
      case 'tokens':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Токены</h2>
            <p className="text-gray-600">Здесь будет отображаться информация о токенах.</p>
            {/* TODO: Реализовать компонент TokensTab */}
          </div>
        );
      case 'calculator':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Калькулятор точки ускорения</h2>
            <p className="text-gray-600">Здесь будет калькулятор точки ускорения.</p>
            {/* TODO: Реализовать компонент CalculatorTab */}
          </div>
        );
      case 'members':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Управление пайщиками</h2>
            <p className="text-gray-600">Здесь будет отображаться список пайщиков.</p>
            {/* TODO: Реализовать компонент MembersTab (Admin/Manager) */}
          </div>
        );
      case 'properties':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Управление недвижимостью</h2>
            <p className="text-gray-600">Здесь будет отображаться список объектов недвижимости.</p>
            {/* TODO: Реализовать компонент PropertiesTab (Admin/Manager) */}
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Управление пользователями</h2>
            <p className="text-gray-600">Здесь будет отображаться список пользователей.</p>
            {/* TODO: Реализовать компонент UsersTab (Admin) */}
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Настройки системы</h2>
            <p className="text-gray-600">Здесь будут настройки системы.</p>
            {/* TODO: Реализовать компонент SettingsTab (Admin) */}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  if (error && !user) {
    // Показываем ошибку только если пользователь не загружен (т.е. не удалось аутентифицироваться)
    return <div className="flex justify-center items-center h-screen text-red-600">Ошибка: {error}</div>;
  }

  return (
      <div className="min-h-screen bg-gray-100">
        <DashboardNavbar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-8">
          {renderTabContent()}
        </main>
      </div>
  );
}

// Обертка для страницы дашборда, чтобы использовать LocaleProvider
const DashboardPage = () => {
  return (
    <LocaleProvider>
      <Dashboard />
    </LocaleProvider>
  );
};

export default DashboardPage;

