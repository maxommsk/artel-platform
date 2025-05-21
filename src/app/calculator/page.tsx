'use client'
import React, { useState, useEffect } from 'react';

// Добавьте этот интерфейс вверху файла, после импортов
interface CalculatorResult {
  estimatedAmount: number;
  period: number;
  initial_payment: number; // Добавлено
  monthly_payment: number; // Добавлено
  // ... добавьте другие поля, если они есть в ответе API и используются в JSX
}



export default function CalculatorPage() {
    const [result, setResult] = useState<CalculatorResult | null>(null);
    const [formData, setFormData] = useState({
        tariff_id: '',
        property_price: '',
        new_members_count: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await fetch('/api/calculator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const data: CalculatorResult = await res.json();
        setResult(data);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Калькулятор</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="tariff_id"
                    placeholder="ID тарифа"
                    value={formData.tariff_id}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
                <input
                    type="number"
                    name="property_price"
                    placeholder="Цена недвижимости"
                    value={formData.property_price}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
                <input
                    type="number"
                    name="new_members_count"
                    placeholder="Кол-во новых участников"
                    value={formData.new_members_count}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Рассчитать
                </button>
            </form>
            {result && (
                <div className="mt-4 p-4 border rounded">
                    <p>Первоначальный взнос: {result.initial_payment}</p>
                    <p>Ежемесячный платёж: {result.monthly_payment}</p>
                </div>
            )}
        </div>
    );
}
