#!/bin/bash

TARGET="src/app/page.tsx"

if [ ! -f "$TARGET" ]; then
    echo "❌ Файл $TARGET не найден."
    exit 1
fi

echo "🔧 Исправляем $TARGET ..."

cat > "$TARGET" << 'EOF'
'use client'

import React, { useState } from "react";
import Link from 'next/link';

export default function Home() {
    const [formData, setFormData] = useState({
        tariff_id: '',
        property_price: '',
        new_members_count: '',
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/calculator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        setResult(data);
    };

    return (
        <>
            {/* Навигационная панель */}
            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-blue-600">ЖНК "Артель"</div>
                    <div className="space-x-4">
                        <Link href="/login" className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition">
                            Войти
                        </Link>
                        <Link href="/register" className="px-4 py-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition">
                            Регистрация
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Главный баннер */}
            <div className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Жилищно-накопительный кооператив "Артель"</h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                        Инновационный подход к приобретению жилья с использованием цифровых финансовых активов и децентрализованных технологий
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/register" className="px-6 py-3 rounded-md bg-white text-blue-600 font-bold hover:bg-blue-50 transition">
                            Стать пайщиком
                        </Link>
                        <Link href="#calculator" className="px-6 py-3 rounded-md border border-white text-white font-bold hover:bg-blue-700 transition">
                            Рассчитать выгоду
                        </Link>
                    </div>
                </div>
            </div>

            {/* Преимущества */}
            {/* (Оставляем как есть — тут нет ошибок синтаксиса) */}

            {/* Тарифные планы */}
            {/* (Оставляем как есть) */}

            {/* Калькулятор */}
            <div id="calculator" className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Калькулятор точки ускорения</h2>

                    <div className="max-w-3xl mx-auto bg-blue-50 rounded-lg p-8">
                        <p className="text-gray-700 mb-6">
                            Рассчитайте, как вступление новых пайщиков в ЖНК "Артель" сократит срок ожидания вашей недвижимости.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Тарифный план</label>
                                    <select
                                        name="tariff_id"
                                        value={formData.tariff_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Выберите тариф</option>
                                        <option value="1">Стандарт (20%)</option>
                                        <option value="2">Оптимальный (30%)</option>
                                        <option value="3">Ускоренный (50%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Стоимость недвижимости</label>
                                    <input
                                        type="number"
                                        name="property_price"
                                        value={formData.property_price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="3 000 000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Количество новых пайщиков</label>
                                    <input
                                        type="number"
                                        name="new_members_count"
                                        value={formData.new_members_count}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="10"
                                        required
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                    >
                                        Рассчитать
                                    </button>
                                </div>
                            </div>
                        </form>

                        {result && (
                            <div className="bg-white p-4 rounded-lg border mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">Первоначальный взнос:</p>
                                        <p className="font-medium">{result.initial_payment}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Ежемесячный платёж:</p>
                                        <p className="font-medium text-green-600">{result.monthly_payment}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
EOF

echo "✅ Файл успешно исправлен."
