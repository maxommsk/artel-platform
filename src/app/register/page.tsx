'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
interface RegisterApiResponse {
  success: boolean;      // Или другое поле, указывающее на успех
  message?: string;     // Опциональное сообщение от API
  error?: string;       // Опциональное поле ошибки
  // ... другие поля, которые может вернуть ваш API регистрации
}


export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data: RegisterApiResponse = await res.json();
        if (res.ok) {
            setMessage('✅ Регистрация успешна!');
                      router.push('/login');
        } else {
            setMessage(`❌ Ошибка: ${data.message || data.error || 'Что-то пошло не так'}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-4 border rounded-lg"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit" className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Зарегистрироваться
                </button>
                {message && <p className="mt-4 text-center text-sm">{message}</p>}
            </form>
        </div>
    );
}
