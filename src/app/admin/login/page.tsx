'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: any;
}

export default function AdminLoginPage() {
    const [username, setUsername] = useState('maxommsk@gmail.com');
    const [password, setPassword] = useState('Maximka1992');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data: LoginApiResponse = await res.json();
            
            if (res.ok) {
                setMessage('✅ Вход выполнен успешно!');
                
                // Сохраняем токен и информацию о пользователе
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                
                // Перенаправление на административную панель
                router.push('/admin/dashboard');
            } else {
                setMessage(`❌ Ошибка: ${data.message || data.error || 'Что-то пошло не так'}`);
            }
        } catch (error) {
            setMessage('❌ Ошибка: Не удалось выполнить запрос');
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Админ вход</h2>
                <input
                   type="text"
                    placeholder="Имя пользователя или Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-4 border rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-4 border rounded-lg"
                />
                <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Войти
                </button>
                {message && <p className="mt-4 text-center text-sm">{message}</p>}
            </form>
        </div>
    );
}
