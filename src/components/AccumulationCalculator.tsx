'use client'

import React, { useState } from 'react'

export default function AccumulationCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(5_000_000)
  const [monthlyContribution, setMonthlyContribution] = useState(40_000)
  const [showResult, setShowResult] = useState(false)

  const monthsTo35 = propertyPrice * 0.35 / monthlyContribution
  const monthsTotal = propertyPrice / monthlyContribution
  const queuePosition = Math.max(1, 100 - Math.floor(monthlyContribution / 10000))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResult(true)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-center">Калькулятор накопления</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Стоимость жилья (₽)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ежемесячный взнос (₽)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-2 text-center">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Рассчитать</button>
        </div>
      </form>
      {showResult && (
        <div className="text-center space-y-2">
          <p>Накопление 35% займет: {Math.ceil(monthsTo35)} месяцев</p>
          <p>Полное накопление: {Math.ceil(monthsTotal)} месяцев</p>
          <p>Ориентировочная позиция в очереди: {queuePosition}</p>
        </div>
      )}
    </div>
  )
}
