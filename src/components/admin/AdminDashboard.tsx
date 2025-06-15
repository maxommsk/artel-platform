'use client';

import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then((data: any) => setUsers(data.users || []));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      setUsers(users.map(u => (u.id === id ? { ...u, status } : u)));
    }
  };

  const sendInvite = async () => {
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail })
    });
    const data = (await res.json()) as any;
    setMessage(data.message || '');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Админ панель</h1>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email для приглашения"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <button onClick={sendInvite} className="bg-blue-500 text-white px-4 py-1 rounded">
          Пригласить администратора
        </button>
      </div>
      {message && <p className="mb-4">{message}</p>}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Статус</th>
            <th className="border px-2 py-1">Действие</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.id}</td>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">
                <select
                  value={user.status || 'новичок'}
                  onChange={e => updateStatus(user.id, e.target.value)}
                >
                  <option value="новичок">новичок</option>
                  <option value="участник ЖНК">участник ЖНК</option>
                  <option value="Вип пользователь">Вип пользователь</option>
                </select>
              </td>
              <td className="border px-2 py-1">
                <button onClick={() => updateStatus(user.id, user.status)} className="px-2 py-1 bg-green-500 text-white rounded">Сохранить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
