'use client';

import React, { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const menu: MenuItem[] = [
  { id: 'main', label: 'Главная панель', icon: '📊' },
  { id: 'members', label: 'Участники кооператива', icon: '👤' },
  { id: 'contributions', label: 'Взносы и накопления', icon: '💰' },
  { id: 'queue', label: 'Очередь на жильё', icon: '🏠' },
  { id: 'applications', label: 'Заявки и обращения', icon: '🗂' },
  { id: 'meetings', label: 'Решения собраний', icon: '📄' },
  { id: 'reports', label: 'Финансовые отчёты', icon: '⚖' },
  { id: 'settings', label: 'Настройки кооператива', icon: '🛠' },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('main');

  const renderSection = () => {
    switch (active) {
      case 'members':
        return <MembersSection />;
      case 'contributions':
        return <ContributionsSection />;
      case 'queue':
        return <QueueSection />;
      case 'applications':
        return <ApplicationsSection />;
      case 'meetings':
        return <MeetingsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <MainPanel />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav className="space-y-2">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded hover:bg-gray-700 ${
                active === item.id ? 'bg-gray-700' : ''
              }`}
            >
              <span className="mr-2 text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <a
            href="/logout"
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            <span className="mr-2 text-xl">🔒</span>Выход
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">{renderSection()}</main>
    </div>
  );
}

function MainPanel() {
  const metrics = [
    { id: 'members', label: 'Число пайщиков', value: '124', icon: '👥' },
    { id: 'savings', label: 'Сумма накоплений', value: '93 500 000 ₽', icon: '💰' },
    { id: 'applications', label: 'Активных заявок', value: '18', icon: '🗂' },
    { id: 'queue', label: 'Очередь на жильё', value: '47 человек', icon: '🏠' },
    { id: 'term', label: 'Средний срок накоплений', value: '4.2 года', icon: '⏱' },
  ];

  const recent = [
    'Иван Петров — обновил профиль (5 мин назад)',
    'Новая заявка от Анны Смирновой',
    'Зачислен взнос: +75 000 ₽ от №102',
    'Решение собрания №17 опубликовано',
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Главная панель</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="bg-white p-4 rounded shadow flex items-center"
          >
            <span className="text-3xl mr-4">{m.icon}</span>
            <div>
              <p className="text-gray-500 text-sm">{m.label}</p>
              <p className="text-xl font-semibold">{m.value}</p>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-2">Последние действия</h2>
      <ul className="space-y-2">
        {recent.map((r, i) => (
          <li key={i} className="bg-white p-3 rounded shadow">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MembersSection() {
  const members = [
    { id: 1, name: 'Иван Петров', status: 'активный', savings: '450 000 ₽', date: '2023-05-01' },
    { id: 2, name: 'Анна Смирнова', status: 'ожидает', savings: '120 000 ₽', date: '2024-01-12' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Участники кооператива</h1>
      <table className="min-w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">ФИО</th>
            <th className="px-4 py-2 text-left">Статус</th>
            <th className="px-4 py-2 text-left">Накопления</th>
            <th className="px-4 py-2 text-left">Дата вступления</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="px-4 py-2">{m.name}</td>
              <td className="px-4 py-2">{m.status}</td>
              <td className="px-4 py-2">{m.savings}</td>
              <td className="px-4 py-2">{m.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContributionsSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Взносы и накопления</h1>
      <p className="mb-2">История поступлений и управление фондами.</p>
      <div className="bg-white p-4 rounded shadow">Раздел в разработке.</div>
    </div>
  );
}

function QueueSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Очередь на жильё</h1>
      <div className="bg-white p-4 rounded shadow">Информация об очереди в разработке.</div>
    </div>
  );
}

function ApplicationsSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Заявки и обращения</h1>
      <div className="bg-white p-4 rounded shadow">Раздел находится в разработке.</div>
    </div>
  );
}

function MeetingsSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Решения собраний</h1>
      <div className="bg-white p-4 rounded shadow">Здесь будут протоколы и голосования.</div>
    </div>
  );
}

function ReportsSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Финансовые отчёты</h1>
      <div className="bg-white p-4 rounded shadow">Раздел в разработке.</div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Настройки кооператива</h1>
      <div className="bg-white p-4 rounded shadow">Настройки будут реализованы позже.</div>
    </div>
  );
}
