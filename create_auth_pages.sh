#!/bin/bash

mkdir -p src/app/login
mkdir -p src/app/register

# === Login Page ===
cat > src/app/login/page.tsx << 'EOF'
'use client'

import React, { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage('✅ Вход выполнен успешно!');
        } else {
            setMessage(`❌ Ошибка: ${data.error || 'Что-то пошло не так'}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Вход</h2>
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
                <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Войти
                </button>
                {message && <p className="mt-4 text-center text-sm">{message}</p>}
            </form>
        </div>
    );
}
EOF

# === Register Page ===
cat > src/app/register/page.tsx << 'EOF'
'use client'

import React, { useState } from 'react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage('✅ Регистрация успешна!');
        } else {
            setMessage(`❌ Ошибка: ${data.error || 'Что-то пошло не так'}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
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
EOF

echo "✅ Страницы /login и /register успешно созданы."
